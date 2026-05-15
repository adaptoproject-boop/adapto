"""
Adaptive Decision Routes
API endpoints for the Central Brain decision-making system
"""

from flask import Blueprint, request, jsonify
from models.adaptive_model import make_adaptive_decision, validate_emotion, validate_quiz_score

adaptive_bp = Blueprint('adaptive', __name__)


@adaptive_bp.route('/decide', methods=['POST'])
def make_decision():
    """
    Get adaptive learning decision based on emotion and quiz performance.
    
    This is the CENTRAL BRAIN endpoint that orchestrates the entire
    adaptive learning experience.
    
    Request Body:
    {
        "emotion": "confused",
        "quiz_score": 45,
        "current_level": "Medium"  // Optional
    }
    
    Response:
    {
        "next_level": "Easy",
        "content_type": "Explanation",
        "require_gemini_explanation": true,
        "require_gemini_motivation": true,
        "reasoning": {
            "emotion_detected": "confused",
            "quiz_score": 45,
            "current_level": "Medium",
            "next_level": "Easy",
            "decision_explanation": "Score 45% shows struggle → Returning to Easy level for review | Confusion detected → Providing Explanation-focused content | Low score → AI motivation needed | Additional AI explanation suggested"
        }
    }
    """
    try:
        data = request.get_json()
        
        # Extract inputs
        emotion = data.get('emotion')
        quiz_score = data.get('quiz_score')
        current_level = data.get('current_level')
        
        # Validate quiz score
        is_valid, error_msg = validate_quiz_score(quiz_score)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Validate emotion (returns normalized emotion)
        _, emotion = validate_emotion(emotion)
        
        # Make adaptive decision
        decision = make_adaptive_decision(
            emotion=emotion,
            quiz_score=quiz_score,
            current_level=current_level
        )
        
        # Check for errors
        if 'error' in decision:
            return jsonify(decision), 400
        
        return jsonify(decision), 200
    
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500


@adaptive_bp.route('/test-scenarios', methods=['GET'])
def get_test_scenarios():
    """
    Get example decision scenarios for testing and understanding the model.
    
    Response: Array of test cases with decisions
    """
    try:
        test_scenarios = [
            {
                "scenario": "High Score + Happy",
                "input": {"emotion": "happy", "quiz_score": 85, "current_level": "Medium"},
                "decision": make_adaptive_decision("happy", 85, "Medium")
            },
            {
                "scenario": "Low Score + Bored",
                "input": {"emotion": "bored", "quiz_score": 40, "current_level": "Medium"},
                "decision": make_adaptive_decision("bored", 40, "Medium")
            },
            {
                "scenario": "Medium Score + Confused",
                "input": {"emotion": "confused", "quiz_score": 55, "current_level": "Easy"},
                "decision": make_adaptive_decision("confused", 55, "Easy")
            },
            {
                "scenario": "Perfect Score + Neutral",
                "input": {"emotion": "neutral", "quiz_score": 100, "current_level": "Hard"},
                "decision": make_adaptive_decision("neutral", 100, "Hard")
            }
        ]
        
        return jsonify({
            "test_scenarios": test_scenarios,
            "note": "These scenarios demonstrate how the adaptive model makes decisions"
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@adaptive_bp.route('/rules', methods=['GET'])
def get_decision_rules():
    """
    Get documentation of all decision rules used by the model.
    
    Response: Structured explanation of decision logic
    """
    rules = {
        "difficulty_rules": {
            "description": "How quiz scores determine next difficulty level",
            "rules": [
                {"condition": "score > 80", "result": "Hard", "reason": "Student mastered content"},
                {"condition": "score >= 50", "result": "Medium", "reason": "Student understood basics"},
                {"condition": "score < 50", "result": "Easy", "reason": "Student needs review"}
            ]
        },
        "content_type_rules": {
            "description": "How emotions determine content style",
            "rules": [
                {"condition": "emotion = bored", "result": "Fun", "reason": "Re-engage with entertaining content"},
                {"condition": "emotion = confused", "result": "Explanation", "reason": "Provide clearer instruction"},
                {"condition": "emotion = happy/neutral", "result": "Standard", "reason": "Normal learning pace"}
            ]
        },
        "ai_assistance_rules": {
            "description": "When AI explanation/motivation is triggered",
            "rules": [
                {"condition": "score < 50", "result": "Explanation + Motivation", "reason": "Student struggling"},
                {"condition": "emotion = confused", "result": "Explanation only", "reason": "Needs clarity"},
                {"condition": "score >= 50 AND not confused", "result": "No AI needed", "reason": "Student progressing well"}
            ]
        }
    }
    
    return jsonify(rules), 200
