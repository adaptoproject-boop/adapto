"""
Learning Routes — API Endpoints for System Orchestrator

Extended with:
  • Dataset-backed curriculum routing (Easy → Medium → Hard)
  • Phase A rule-based adaptive classifier
  • Streak tracking (wrong / correct)
  • /api/learning/next-step  now returns next_lesson from curriculum
"""

from flask import Blueprint, request, jsonify
from controllers.orchestrator import complete_lesson_flow, get_student_progress_summary
from routes.curriculum_routes import (
    CURRICULUM,
    get_lesson_by_id,
    get_lessons_for_subject,
    get_next_lesson,
)
from models.adaptive_model import extract_features_from_session, classify_difficulty_rules
from models.analytics_model import write_emotion_log

learning_bp = Blueprint('learning', __name__)

# In-memory emotion accumulator per session (resets when session ends)
_emotion_accumulator: dict = {}   # { session_id: {emotion: count, total: count} }


# ---------------------------------------------------------------------------
# Helper — find current lesson by topic + subject
# ---------------------------------------------------------------------------

def _find_lesson_by_topic(subject: str, topic: str):
    """Try to match a lesson from the curriculum by subject + topic name."""
    for lesson in CURRICULUM:
        if lesson['subject'].lower() == subject.lower() and lesson['topic'].lower() == topic.lower():
            return lesson
    return None


def _find_lesson_by_id_or_topic(lesson_id: str, subject: str, topic: str):
    """Try ID first, then fall back to topic match."""
    lesson = get_lesson_by_id(lesson_id) if lesson_id else None
    if not lesson and subject and topic:
        lesson = _find_lesson_by_topic(subject, topic)
    return lesson


# ---------------------------------------------------------------------------
# POST /api/learning/next-step
# ---------------------------------------------------------------------------

@learning_bp.route('/next-step', methods=['POST'])
def get_next_learning_step():
    """
    MAIN ORCHESTRATOR API — Get the personalised next learning step.

    Request Body:
    {
        "user_id":      "user123",
        "subject":      "Numbers & Math",
        "topic":        "Counting 1-10",
        "lesson_id":    "<uuid>",          // optional but preferred
        "quiz_score":   85,                // percentage 0-100
        "current_level": "Easy",
        "emotion":       "happy",          // optional
        "response_times": [8, 12, 6],      // optional seconds per question
        "streak_wrong":   0,               // optional, tracked by frontend
        "streak_correct": 3                // optional
    }

    Response adds:
    {
        "next_difficulty": "hard",           // 'easy' | 'same' | 'hard'
        "next_lesson":     { ...lesson }     // full lesson from curriculum
        "next_topic":      "Multiplication",
        "encouragement":   false,
        "level_up":        true,
        ...existing orchestrator fields...
    }
    """
    try:
        data = request.get_json() or {}

        # -- Required minimum
        if 'quiz_score' not in data:
            return jsonify({'error': 'quiz_score is required'}), 400

        user_id       = data.get('user_id', 'anonymous')
        subject       = data.get('subject', '')
        topic         = data.get('topic', '')
        lesson_id     = data.get('lesson_id', '')
        quiz_score    = int(data.get('quiz_score', 0))
        current_level = data.get('current_level', 'Easy')
        emotion       = data.get('emotion', 'neutral')
        response_times = data.get('response_times', [])
        streak_wrong  = int(data.get('streak_wrong', 0))
        streak_correct = int(data.get('streak_correct', 0))

        # ------------------------------------------------------------------
        # 1. Build features and classify difficulty (Phase A)
        # ------------------------------------------------------------------
        session_payload = {
            'quiz_score':      quiz_score,
            'emotion':         emotion,
            'streak_wrong':    streak_wrong,
            'streak_correct':  streak_correct,
            'video_completion': float(data.get('video_completion', 1.0)),
            'retries':         int(data.get('retries', 0)),
        }
        if response_times:
            avg_time = sum(response_times) / len(response_times)
            session_payload['pace_score'] = max(0.0, 1.0 - avg_time / 40.0)

        features       = extract_features_from_session(session_payload)
        next_difficulty = classify_difficulty_rules(features)   # 'easy' | 'same' | 'hard'

        # ------------------------------------------------------------------
        # 2. Look up the next lesson from the curriculum dataset
        # ------------------------------------------------------------------
        current_lesson = _find_lesson_by_id_or_topic(lesson_id, subject, topic)
        next_lesson    = None

        if current_lesson:
            next_lesson = get_next_lesson(current_lesson['id'], next_difficulty)
        elif subject:
            # No current lesson found — serve the easiest lesson for this subject
            subject_lessons = get_lessons_for_subject(subject)
            if subject_lessons:
                target_diff = {'easy': 'Easy', 'same': current_level or 'Easy', 'hard': 'Hard'}
                want = target_diff.get(next_difficulty, current_level or 'Easy')
                candidates = [l for l in subject_lessons if l['difficulty'] == want]
                next_lesson = candidates[0] if candidates else subject_lessons[0]

        # ------------------------------------------------------------------
        # 3. Call the orchestrator for videos / gemini (legacy path)
        # ------------------------------------------------------------------
        orchestrator_response = complete_lesson_flow(
            user_id=user_id,
            subject=subject,
            topic=topic,
            quiz_score=quiz_score,
            current_level=current_level,
            emotion=emotion,
            response_times=response_times if response_times else None
        )

        # ------------------------------------------------------------------
        # 4. Merge and return
        # ------------------------------------------------------------------
        next_topic_name = next_lesson['topic'] if next_lesson else orchestrator_response.get('next_topic', topic)
        next_level_name = next_lesson['difficulty'] if next_lesson else current_level

        response = {
            **orchestrator_response,
            # Adaptive engine outputs
            'next_difficulty':  next_difficulty,           # 'easy' | 'same' | 'hard'
            'next_level':       next_level_name,           # 'Easy' | 'Medium' | 'Hard'
            'next_topic':       next_topic_name,
            'next_lesson':      next_lesson,               # Full lesson object (or None)
            'features':         features,
            'encouragement':    next_difficulty == 'easy',
            'level_up':         next_difficulty == 'hard',
            # Streaks
            'streak_wrong':     streak_wrong,
            'streak_correct':   streak_correct,
        }

        return jsonify(response), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# ---------------------------------------------------------------------------
# POST /api/learning/video-event  (track video engagement)
# ---------------------------------------------------------------------------

@learning_bp.route('/video-event', methods=['POST'])
def log_video_event():
    """Log video play/pause/seek/end events for behaviour tracking."""
    data = request.get_json() or {}
    event = data.get('event', 'unknown')
    # Track replay count in the accumulator
    session_id = data.get('session_id', 'default')
    if event == 'play' and data.get('replay'):
        acc = _emotion_accumulator.setdefault(session_id, {})
        acc['replay_count'] = acc.get('replay_count', 0) + 1
    return jsonify({
        'success': True,
        'event': event,
        'message': 'Event logged'
    }), 200


# ---------------------------------------------------------------------------
# POST /api/emotion/log  (webcam emotion reading every 5 s)
# ---------------------------------------------------------------------------

@learning_bp.route('/emotion-log', methods=['POST'])
def log_emotion():
    """
    Receive a single emotion reading from the frontend EmotionDetector.
    Called every 5 seconds by the webcam component.

    Body: { kid_id, session_id, emotion, timestamp }
    """
    data = request.get_json() or {}
    kid_id     = data.get('kid_id', 'unknown')
    session_id = data.get('session_id', 'default')
    emotion    = data.get('emotion', 'engaged')

    # Update in-memory accumulator for confused_ratio calculation
    acc = _emotion_accumulator.setdefault(session_id, {'total': 0})
    acc['total'] = acc.get('total', 0) + 1
    acc[emotion] = acc.get(emotion, 0) + 1

    # Persist to Supabase (non-blocking)
    write_emotion_log(kid_id, session_id, emotion)

    # Return running confused_ratio so frontend can use it
    confused_readings = acc.get('confused', 0) + acc.get('bored', 0)
    confused_ratio    = confused_readings / acc['total'] if acc['total'] > 0 else 0.0

    return jsonify({
        'success':       True,
        'emotion':       emotion,
        'confused_ratio': round(confused_ratio, 3),
        'session_id':    session_id
    }), 200


# ---------------------------------------------------------------------------
# GET /api/learning/progress/<user_id>
# ---------------------------------------------------------------------------

@learning_bp.route('/progress/<user_id>', methods=['GET'])
def get_learning_progress(user_id):
    try:
        progress = get_student_progress_summary(user_id)
        return jsonify(progress), 200 if 'error' not in progress else 500
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# ---------------------------------------------------------------------------
# GET /api/learning/flow-info
# ---------------------------------------------------------------------------

@learning_bp.route('/flow-info', methods=['GET'])
def get_flow_info():
    return jsonify({
        'workflow_phases': [
            {'phase': 'A', 'name': 'Rule-Based Classifier', 'status': 'active', 'description': 'Ships day 1, no training data required'},
            {'phase': 'B', 'name': 'Random Forest',         'status': 'pending', 'description': 'Activates after 500+ labelled sessions'},
            {'phase': 'C', 'name': 'Per-Kid Personalisation','status': 'future', 'description': 'Bayesian threshold updates after 2000+ sessions'},
        ],
        'decision_table': [
            {'condition': 'Wrong streak >= 3',             'result': 'easy'},
            {'condition': 'Score < 50% OR confused > 40%', 'result': 'easy'},
            {'condition': 'Score 50–79%',                  'result': 'same'},
            {'condition': 'Score >= 80% + engaged > 60%',  'result': 'hard'},
            {'condition': 'Correct streak >= 5',           'result': 'hard'},
        ],
        'endpoints': {
            'next_step':   'POST /api/learning/next-step',
            'progress':    'GET  /api/learning/progress/:userId',
            'video_event': 'POST /api/learning/video-event',
            'curriculum':  'GET  /api/curriculum/all',
        }
    }), 200
