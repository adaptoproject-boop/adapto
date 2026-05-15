"""
System Orchestrator - Central Coordinator for Adaptive E-Learning Platform

This is the SINGLE ENTRY POINT for the complete adaptive learning workflow.
It integrates all independent AI models into a coordinated, seamless experience.

PURPOSE:
--------
The System Orchestrator coordinates the entire learning journey:
    Student Emotion → Quiz Evaluation → Adaptive Decision → 
    YouTube Videos → Gemini AI Support → Analytics Update

WHY ORCHESTRATION LAYER?
-------------------------
1. **Separation of Concerns**: Each model handles one specific task
2. **Modularity**: Models can be updated independently
3. **Maintainability**: Single place to understand complete flow
4. **Scalability**: Easy to add new models or swap implementations
5. **Testing**: Each model can be tested in isolation

DESIGN PRINCIPLE:
-----------------
This orchestrator contains NO business logic itself.
It ONLY calls other models and combines their outputs.
All decision-making logic lives in respective models.

ARCHITECTURE:
-------------
                    ┌─────────────────────┐
                    │  Frontend Request   │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ SYSTEM ORCHESTRATOR │ ◄── THIS FILE
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Emotion Model │     │ Adaptive Model│     │ YouTube Model │
└───────────────┘     └───────────────┘     └───────────────┘
        ▼                      ▼                      ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ Quiz Model    │     │  Gemini Model │     │Analytics Model│
└───────────────┘     └───────────────┘     └───────────────┘
        │                      │                      │
        └──────────────────────┴──────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Unified Response   │
                    └─────────────────────┘
"""

import logging
from typing import Dict, Optional, Any

# Import all independent models
from models.adaptive_model import make_adaptive_decision
from models.youtube_model import get_youtube_videos
from models.gemini_model import generate_gemini_response
from models.emotion_model import detect_emotion
from models.analytics_model import track_learning_progress, get_parent_analytics

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ==================================================
# MAIN ORCHESTRATOR FUNCTION
# ==================================================

def complete_lesson_flow(
    user_id: str,
    subject: str,
    topic: str,
    quiz_score: int,
    current_level: str,
    emotion: Optional[str] = None,
    response_times: Optional[list] = None
) -> Dict[str, Any]:
    """
    SYSTEM ORCHESTRATOR: Complete adaptive learning workflow.
    
    This function coordinates ALL AI models to provide a personalized
    learning experience for a child.
    
    WORKFLOW:
    ---------
    1. Detect emotion (custom local model)
    2. Call Adaptive Decision Model (central brain)
    3. Fetch YouTube videos based on decision (local bank)
    4. Get AI Support if needed (local custom models)
    5. Return unified response
    """
    
    logger.info(f"Starting orchestration for user {user_id}, subject: {subject}, topic: {topic}")
    
    try:
        # ============================================
        # STEP 1: Detect Emotion (Custom Local Model)
        # ============================================
        detected_emotion = detect_emotion(
            face_expression=emotion,
            quiz_score=quiz_score,
            response_times=response_times
        )
        
        logger.info(f"Emotion detected: {detected_emotion}")
        
        # ============================================
        # STEP 2: Adaptive Decision (Central Brain)
        # ============================================
        adaptive_decision = make_adaptive_decision(
            emotion=detected_emotion,
            quiz_score=quiz_score,
            current_level=current_level,
            response_times=response_times
        )
        
        if "error" in adaptive_decision:
            logger.error(f"Adaptive decision error: {adaptive_decision['error']}")
            return get_fallback_response(subject, topic, current_level)
        
        logger.info(f"Adaptive decision: {adaptive_decision['next_level']} level, {adaptive_decision['next_action']} action")
        
        # ============================================
        # STEP 3: Fetch Videos (Local Bank)
        # ============================================
        youtube_videos = get_youtube_videos(
            subject=subject,
            topic=topic,
            difficulty=adaptive_decision['next_level'],
            content_type=adaptive_decision['content_type']
        )
        
        # ============================================
        # STEP 4: AI Support (Local Custom Models)
        # ============================================
        gemini_explanation = None
        gemini_motivation = None
        
        if adaptive_decision.get('require_gemini_explanation'):
            explanation_response = generate_gemini_response(
                subject=subject,
                topic=topic,
                difficulty=adaptive_decision['next_level'],
                request_type='explanation'
            )
            gemini_explanation = explanation_response.get('content')
        
        if adaptive_decision.get('require_gemini_motivation'):
            motivation_response = generate_gemini_response(
                subject=subject,
                topic=topic,
                difficulty=adaptive_decision['next_level'],
                request_type='motivation',
                context={"score": quiz_score}
            )
            gemini_motivation = motivation_response.get('content')
        
        # ============================================
        # STEP 5: Track Analytics
        # ============================================
        track_learning_progress(user_id, subject, topic, quiz_score, detected_emotion)

        # ============================================
        # STEP 6: Compile Unified Response
        # ============================================
        unified_response = {
            "success": True,
            "user_id": user_id,
            "subject": subject,
            "topic": topic,
            "next_topic": get_next_topic(subject, topic) if adaptive_decision['next_action'] == 'NEXT_TOPIC' else topic,
            "next_action": adaptive_decision['next_action'],
            
            # Adaptive Decision Output
            "next_level": adaptive_decision['next_level'],
            "content_type": adaptive_decision['content_type'],
            "avg_response_time": adaptive_decision.get('average_response_time'),
            "adaptive_reasoning": adaptive_decision.get('reasoning', {}),
            
            # Local Video Recommendations
            "youtube_videos": youtube_videos.get('videos', []),
            
            # AI Support
            "gemini_explanation": gemini_explanation,
            "gemini_motivation": gemini_motivation,
            
            # Metadata
            "emotion_detected": detected_emotion,
            "quiz_score": quiz_score,
            "previous_level": current_level
        }
        
        return unified_response
    
    except Exception as e:
        logger.error(f"Orchestration error: {str(e)}")
        return get_fallback_response(subject, topic, current_level, error=str(e))


# ==================================================
# HELPER FUNCTIONS
# ==================================================

def get_dummy_emotion(quiz_score: int) -> str:
    """
    Dummy emotion detection based on quiz score.
    
    In production, replace with real emotion detection model using:
    - Computer Vision (facial expression analysis)
    - Engagement metrics (time spent, interaction patterns)
    - ML model trained on student behavior
    
    Args:
        quiz_score (int): Quiz score percentage
    
    Returns:
        str: Emotion (happy, neutral, confused, bored)
    """
    if quiz_score >= 80:
        return "happy"
    elif quiz_score >= 50:
        return "neutral"
    elif quiz_score >= 30:
        return "confused"
    else:
        return "frustrated"


def get_fallback_response(
    subject: str,
    topic: str,
    current_level: str,
    error: Optional[str] = None
) -> Dict[str, Any]:
    """
    Provide safe fallback response if orchestration fails.
    
    This ensures the learning flow NEVER breaks, even if models fail.
    
    Args:
        subject (str): Subject name
        topic (str): Topic name
        current_level (str): Current difficulty
        error (str, optional): Error message
    
    Returns:
        dict: Safe fallback response
    """
    logger.warning(f"Using fallback response due to error: {error}")
    
    return {
        "success": False,
        "fallback": True,
        "error": error,
        
        # Safe defaults
        "next_level": current_level,  # Keep same level
        "content_type": "Standard",
        "youtube_videos": [],
        "gemini_explanation": None,
        "gemini_motivation": "Keep trying! Every mistake is a step towards learning. 🌟",
        
        # Metadata
        "subject": subject,
        "topic": topic,
        "next_topic": topic,
        "adaptive_reasoning": {
            "decision_explanation": "Fallback mode - using safe defaults"
        }
    }


def get_next_topic(subject: str, current_topic: str) -> str:
    """
    Determine the next topic in a sequence for a subject based on the new curriculum.
    """
    curriculum = {
        "Language Basics": ["Phonics (Letter Sounds)", "Simple Words (cat, bat, ball)", "Rhymes & Storytelling"],
        "Numbers & Math": ["Number Recognition", "Basic Addition & Subtraction", "Bigger vs Smaller"],
        "Logical Thinking": ["Patterns", "Match the following", "Find the odd one out"],
        "Environment & Nature": ["Animals & their sounds", "Fruits & vegetables", "Seasons & weather"],
        "Shapes & Colors": ["Basic shapes (circle, square, triangle)", "Advanced shapes (rectangle, oval, star)", "Colors recognition"],
        "General Awareness": ["Body parts", "Family members", "Good habits (brushing, hygiene, sharing)"]
    }
    
    # Normalize subject and topic for matching
    topics = curriculum.get(subject)
    if not topics:
        # Try finding the subject if it's slightly misspelled or case-different
        for k in curriculum.keys():
            if k.lower() == subject.lower():
                topics = curriculum[k]
                break
    
    if topics and current_topic in topics:
        idx = topics.index(current_topic)
        if idx < len(topics) - 1:
            return topics[idx + 1]
    
    # Fallback to current if no next found
    return current_topic


# ==================================================
# ANALYTICS INTEGRATION
# ==================================================

def get_student_progress_summary(user_id: str) -> Dict[str, Any]:
    """
    Get complete student progress analytics.
    
    This calls the Analytics Model to fetch parent/teacher insights.
    
    Args:
        user_id (str): Student's unique ID
    
    Returns:
        dict: Analytics data
    """
    try:
        analytics = get_parent_analytics(user_id)
        return analytics
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        return {"error": f"Analytics unavailable: {str(e)}"}


# ==================================================
# BATCH PROCESSING (Optional - Future Enhancement)
# ==================================================

def process_multiple_students(student_requests: list) -> list:
    """
    Process learning flow for multiple students in batch.
    
    Useful for:
    - Class-wide lesson planning
    - Parallel processing
    - Performance optimization
    
    Args:
        student_requests (list): List of student request dicts
    
    Returns:
        list: List of orchestrated responses
    """
    responses = []
    
    for request in student_requests:
        response = complete_lesson_flow(
            user_id=request.get('user_id'),
            subject=request.get('subject'),
            topic=request.get('topic'),
            quiz_score=request.get('quiz_score'),
            current_level=request.get('current_level'),
            emotion=request.get('emotion')
        )
        responses.append(response)
    
    return responses


# ==================================================
# TESTING
# ==================================================

if __name__ == "__main__":
    print("Testing System Orchestrator...")
    print("=" * 60)
    
    # Test case 1: High score, happy student
    test1 = complete_lesson_flow(
        user_id="test_user_1",
        subject="Alphabets",
        topic="A for Apple",
        quiz_score=85,
        current_level="Easy",
        emotion="happy"
    )
    
    print("\nTest 1 - High Score:")
    print(f"Next Level: {test1['next_level']}")
    print(f"Content Type: {test1['content_type']}")
    print(f"Videos: {len(test1.get('youtube_videos', []))}")
    print(f"Explanation: {'Yes' if test1.get('gemini_explanation') else 'No'}")
    print(f"Motivation: {'Yes' if test1.get('gemini_motivation') else 'No'}")
    
    # Test case 2: Low score, confused student
    test2 = complete_lesson_flow(
        user_id="test_user_2",
        subject="Numbers",
        topic="Counting 1-10",
        quiz_score=35,
        current_level="Medium",
        emotion="confused"
    )
    
    print("\nTest 2 - Low Score:")
    print(f"Next Level: {test2['next_level']}")
    print(f"Content Type: {test2['content_type']}")
    print(f"Videos: {len(test2.get('youtube_videos', []))}")
    print(f"Explanation: {'Yes' if test2.get('gemini_explanation') else 'No'}")
    print(f"Motivation: {'Yes' if test2.get('gemini_motivation') else 'No'}")
    
    print("\n" + "=" * 60)
    print("System Orchestrator ready!")
