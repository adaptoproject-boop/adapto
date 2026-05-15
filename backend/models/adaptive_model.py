"""
Adaptive Decision Model — Phase A Rule-Based Classifier
Central Brain of the ADAPTO E-Learning System

Implements the ADAPTO ML Plan Phase A (rule-based) decision engine.
Phase B (Random Forest) activates after 500+ labelled sessions.

Decision Table:
    Wrong streak >= 3                         → easy
    Score < 50% OR confused_ratio > 0.40     → easy
    Score 50–79%                              → same (swap video only)
    Score >= 80% AND engaged >= 60%           → hard
    Correct streak >= 5                       → hard + bonus stars
"""

import logging

logger = logging.getLogger(__name__)

# ==================================================
# PHASE A THRESHOLDS (Rule-Based)
# ==================================================

EASY_THRESHOLD   = 0.50   # below this → drop to easy
HARD_THRESHOLD   = 0.80   # at/above this + engaged → advance to hard
CONFUSED_LIMIT   = 0.40   # confused > 40% of session → drop to easy
ENGAGED_MIN      = 0.60   # engaged ratio must be > 60% to advance
WRONG_STREAK_MAX = 3      # 3 consecutive wrong → immediate easy
RIGHT_STREAK_MIN = 5      # 5 consecutive correct → immediate hard


# ==================================================
# PHASE A — MAIN CLASSIFIER
# ==================================================

def classify_difficulty_rules(features: dict) -> str:
    """
    Phase A rule-based difficulty classifier.
    Returns: 'easy' | 'same' | 'hard'

    features dict expected keys:
        composite_score   float  0–1
        confused_ratio    float  0–1
        streak_wrong      int
        streak_correct    int
        pace_score        float  0–1    (optional, default 1.0)
        video_completion  float  0–1    (optional, default 1.0)
    """
    score      = float(features.get('composite_score', 0))
    confused   = float(features.get('confused_ratio', 0))
    engaged    = 1.0 - confused
    w_streak   = int(features.get('streak_wrong', 0))
    c_streak   = int(features.get('streak_correct', 0))

    # Rule 1: Immediate drop — too many wrong in a row
    if w_streak >= WRONG_STREAK_MAX:
        logger.info(f"Rule 1 triggered: wrong_streak={w_streak} >= {WRONG_STREAK_MAX} → easy")
        return 'easy'

    # Rule 2: Score too low or too confused
    if score < EASY_THRESHOLD or confused > CONFUSED_LIMIT:
        logger.info(f"Rule 2 triggered: score={score:.2f}, confused={confused:.2f} → easy")
        return 'easy'

    # Rule 3: Immediate advance — mastery streak
    if c_streak >= RIGHT_STREAK_MIN:
        logger.info(f"Rule 3 triggered: correct_streak={c_streak} >= {RIGHT_STREAK_MIN} → hard")
        return 'hard'

    # Rule 4: High score + engaged → advance
    if score >= HARD_THRESHOLD and engaged >= ENGAGED_MIN:
        logger.info(f"Rule 4 triggered: score={score:.2f}, engaged={engaged:.2f} → hard")
        return 'hard'

    # Default: stay at same level (swap video)
    logger.info(f"Default: score={score:.2f}, confused={confused:.2f} → same")
    return 'same'


# ==================================================
# COMPOSITE SCORE BUILDER
# ==================================================

def build_composite_score(
    quiz_score_pct: float,
    confused_ratio: float = 0.0,
    pace_score: float = 1.0,
    video_completion: float = 1.0,
    retries: int = 0
) -> float:
    """
    Weighted composite score per ML plan:
        0.35 × quiz_score_rolling
        0.25 × (1 - confused_ratio)
        0.18 × pace_score
        0.12 × video_completion
        0.10 × (1 - normalised_retries)
    """
    quiz_norm          = max(0.0, min(1.0, quiz_score_pct / 100.0))
    norm_retries       = min(retries / 5.0, 1.0)

    composite = (
        0.35 * quiz_norm +
        0.25 * (1.0 - confused_ratio) +
        0.18 * pace_score +
        0.12 * video_completion +
        0.10 * (1.0 - norm_retries)
    )
    return round(min(max(composite, 0.0), 1.0), 4)


# ==================================================
# FEATURE EXTRACTOR
# ==================================================

def extract_features_from_session(session: dict) -> dict:
    """
    Build the features dict from a session payload.

    session expected keys (all optional, safe defaults applied):
        quiz_score      int/float   percentage 0–100
        confused_ratio  float       0–1
        pace_score      float       0–1
        video_completion float      0–1
        retries         int
        streak_wrong    int
        streak_correct  int
        emotion         str         e.g. 'confused', 'happy', 'bored'
    """
    quiz_score       = float(session.get('quiz_score', 0))
    confused_ratio   = float(session.get('confused_ratio', 0.0))
    pace_score       = float(session.get('pace_score', 1.0))
    video_completion = float(session.get('video_completion', 1.0))
    retries          = int(session.get('retries', 0))
    streak_wrong     = int(session.get('streak_wrong', 0))
    streak_correct   = int(session.get('streak_correct', 0))

    # Infer confused_ratio from emotion if not provided
    emotion = (session.get('emotion') or 'neutral').lower()
    if confused_ratio == 0.0:
        emotion_confused_map = {
            'confused':   0.50,
            'frustrated': 0.45,
            'bored':      0.30,
            'sad':        0.35,
            'neutral':    0.10,
            'happy':      0.05,
            'engaged':    0.02,
        }
        confused_ratio = emotion_confused_map.get(emotion, 0.10)

    composite = build_composite_score(
        quiz_score_pct=quiz_score,
        confused_ratio=confused_ratio,
        pace_score=pace_score,
        video_completion=video_completion,
        retries=retries
    )

    return {
        'composite_score':  composite,
        'quiz_score_pct':   quiz_score,
        'confused_ratio':   confused_ratio,
        'pace_score':       pace_score,
        'video_completion': video_completion,
        'streak_wrong':     streak_wrong,
        'streak_correct':   streak_correct,
        'emotion':          emotion,
    }


# ==================================================
# MAIN ADAPTIVE DECISION (backwards-compatible)
# ==================================================

def make_adaptive_decision(emotion, quiz_score, current_level=None, response_times=None):
    """
    CENTRAL BRAIN — backwards-compatible entry point used by orchestrator.
    Returns the same dict shape as before, with additional 'next_difficulty' key.
    """
    quiz_score = max(0, min(100, quiz_score or 0))

    avg_time = None
    if response_times and len(response_times) > 0:
        avg_time = sum(response_times) / len(response_times)

    if not emotion:
        emotion = 'neutral'

    # Build features
    pace_score = 1.0
    if avg_time:
        # Slow pace if avg > 20 seconds per question
        pace_score = max(0.0, 1.0 - (avg_time / 40.0))

    session = {
        'quiz_score':      quiz_score,
        'emotion':         emotion,
        'pace_score':      pace_score,
        'video_completion': 1.0,
        'retries':         0,
        'streak_wrong':    0,
        'streak_correct':  0,
    }
    features = extract_features_from_session(session)

    # Phase A classification
    next_difficulty = classify_difficulty_rules(features)

    # Map to legacy level names (capitalize)
    level_map = {'easy': 'Easy', 'same': current_level or 'Easy', 'hard': 'Hard'}
    if next_difficulty == 'same':
        # Keep the same as current
        next_level_display = (current_level or 'Easy').capitalize()
    else:
        next_level_display = next_difficulty.capitalize()

    # Legacy content type
    content_type = decide_content_type(emotion)
    next_action  = decide_next_action(quiz_score, avg_time)
    ai_assistance = require_ai_assistance(quiz_score, emotion)

    reasoning = {
        'emotion_detected':     emotion,
        'quiz_score':           quiz_score,
        'avg_time':             avg_time,
        'composite_score':      features['composite_score'],
        'confused_ratio':       features['confused_ratio'],
        'current_level':        current_level or 'Easy',
        'next_level':           next_level_display,
        'next_difficulty':      next_difficulty,
        'next_action':          next_action,
        'decision_explanation': _build_explanation(features, next_difficulty, next_action, emotion, content_type)
    }

    return {
        'next_level':                 next_level_display,
        'next_difficulty':            next_difficulty,   # 'easy' | 'same' | 'hard'
        'content_type':               content_type,
        'next_action':                next_action,
        'average_response_time':      avg_time,
        'require_gemini_explanation': ai_assistance['require_gemini_explanation'],
        'require_gemini_motivation':  ai_assistance['require_gemini_motivation'],
        'reasoning':                  reasoning,
        'encouragement':              next_difficulty == 'easy',
        'level_up':                   next_difficulty == 'hard',
        'features':                   features,
    }


def _build_explanation(features, next_difficulty, next_action, emotion, content_type):
    parts = []
    score = features['composite_score']
    confused = features['confused_ratio']
    w = features['streak_wrong']
    c = features['streak_correct']

    if w >= WRONG_STREAK_MAX:
        parts.append(f"Wrong streak {w} → drop to Easy 🎯")
    elif score < EASY_THRESHOLD:
        parts.append(f"Score {score:.0%} < 50% threshold → Easy")
    elif confused > CONFUSED_LIMIT:
        parts.append(f"Confusion {confused:.0%} > 40% limit → Easy")
    elif c >= RIGHT_STREAK_MIN:
        parts.append(f"Correct streak {c} → advance to Hard ⭐")
    elif next_difficulty == 'hard':
        parts.append(f"Score {score:.0%} ≥ 80% and engaged → Hard")
    else:
        parts.append(f"Score {score:.0%} (50–79%) → Same level, new video")

    parts.append(f"Emotion {emotion} → {content_type} style")
    parts.append(f"Action: {next_action}")
    return ' | '.join(parts)


# ==================================================
# LEGACY HELPERS (unchanged interface)
# ==================================================

def decide_next_action(quiz_score, avg_time):
    if quiz_score < 50:
        return 'REVISION'
    elif quiz_score < 80:
        return 'SIMILAR'
    else:
        return 'NEXT_TOPIC'


def decide_difficulty_level(quiz_score, avg_time, current_level='Easy'):
    level_order = ['Easy', 'Medium', 'Hard']
    try:
        curr_idx = level_order.index(current_level.capitalize())
    except Exception:
        curr_idx = 0
    if quiz_score >= 80 and (avg_time is None or avg_time < 10):
        return level_order[min(len(level_order) - 1, curr_idx + 1)]
    elif quiz_score < 40:
        return level_order[max(0, curr_idx - 1)]
    return level_order[curr_idx]


def decide_content_type(emotion):
    emotion_lower = emotion.lower() if emotion else 'neutral'
    if emotion_lower in ('bored', 'sad'):
        return 'Fun'
    elif emotion_lower in ('confused', 'frustrated'):
        return 'Explanation'
    return 'Standard'


def require_ai_assistance(quiz_score, emotion):
    emotion_lower = emotion.lower() if emotion else 'neutral'
    if quiz_score < 50 or emotion_lower in ('frustrated', 'sad'):
        return {'require_gemini_explanation': True, 'require_gemini_motivation': True}
    elif emotion_lower == 'confused':
        return {'require_gemini_explanation': True, 'require_gemini_motivation': False}
    return {'require_gemini_explanation': False, 'require_gemini_motivation': False}


def validate_emotion(emotion):
    valid = ['happy', 'bored', 'confused', 'neutral', 'sad', 'frustrated', 'engaged']
    if not emotion:
        return True, 'neutral'
    el = emotion.lower()
    return True, el if el in valid else 'neutral'


def validate_quiz_score(score):
    if score is None:
        return False, 'Quiz score is required'
    try:
        score = int(score)
        return (True, None) if 0 <= score <= 100 else (False, 'Quiz score must be between 0 and 100')
    except (ValueError, TypeError):
        return False, 'Quiz score must be a number'


def get_safe_default_decision():
    return {
        'next_level': 'Easy',
        'next_difficulty': 'easy',
        'content_type': 'Standard',
        'require_gemini_explanation': False,
        'require_gemini_motivation': False,
        'reasoning': {'decision_explanation': 'Using safe default due to invalid input'}
    }


# ==================================================
# TEST
# ==================================================

if __name__ == '__main__':
    import sys
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)

    cases = [
        {'quiz_score': 25,  'emotion': 'confused',  'expected': 'easy'},
        {'quiz_score': 60,  'emotion': 'neutral',   'expected': 'same'},
        {'quiz_score': 88,  'emotion': 'happy',     'expected': 'hard'},
        {'quiz_score': 50,  'emotion': 'confused',  'expected': 'easy'},
        {'quiz_score': 80,  'emotion': 'bored',     'expected': 'same'},  # bored increases confusion
    ]

    print("Phase A Classifier Test")
    print("=" * 60)
    for c in cases:
        session = {'quiz_score': c['quiz_score'], 'emotion': c['emotion']}
        features = extract_features_from_session(session)
        result = classify_difficulty_rules(features)
        status = '✅' if result == c['expected'] else '❌'
        print(f"{status} score={c['quiz_score']:3d}% emotion={c['emotion']:10s} → {result:4s} (expected {c['expected']})")
