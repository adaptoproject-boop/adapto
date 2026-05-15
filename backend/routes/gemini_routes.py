"""
Gemini AI Routes
API endpoints for AI-powered learning assistance
"""

from flask import Blueprint, request, jsonify
from models.gemini_model import generate_gemini_response, validate_inputs

gemini_bp = Blueprint('gemini', __name__)


@gemini_bp.route('/api/gemini/generate', methods=['POST'])
def generate_ai_content():
    """
    Generate AI-powered educational content using Gemini.
    
    Request Body:
    {
        "subject": "Alphabets",
        "topic": "A for Apple",
        "difficulty": "Easy",          // Optional: "Easy", "Medium", "Hard"
        "request_type": "explanation", // "explanation", "quiz", "motivation", "teacher_help"
        "context": {                   // Optional: Additional context
            "score": 85,               // For motivation
            "context": "custom text"   // For motivation
        }
    }
    
    Response:
   {
        "request_type": "explanation",
        "subject": "Alphabets",
        "topic": "A for Apple",
        "difficulty": "Easy",
        "content": "AI-generated content here..."
    }
    """
    try:
        data = request.get_json()
        
        # Required fields
        subject = data.get('subject')
        topic = data.get('topic')
        request_type = data.get('request_type', 'explanation')
        
        # Optional fields
        difficulty = data.get('difficulty', 'Medium')
        context = data.get('context')
        
        # Validate inputs
        is_valid, error_msg = validate_inputs(subject, topic, difficulty, request_type)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Generate AI content
        result = generate_gemini_response(
            subject=subject,
            topic=topic,
            difficulty=difficulty,
            request_type=request_type,
            context=context
        )
        
        # Check for errors
        if 'error' in result and not result.get('content'):
            return jsonify(result), 500
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500


@gemini_bp.route('/api/gemini/explain', methods=['POST'])
def explain_topic():
    """
    Quick endpoint for topic explanations.
    
    Request Body:
    {
        "subject": "Numbers",
        "topic": "Counting 1 to 10",
        "difficulty": "Easy"
    }
    """
    try:
        data = request.get_json()
        
        result = generate_gemini_response(
            subject=data.get('subject'),
            topic=data.get('topic'),
            difficulty=data.get('difficulty', 'Medium'),
            request_type='explanation'
        )
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@gemini_bp.route('/api/gemini/quiz', methods=['POST'])
def generate_quiz():
    """
    Quick endpoint for quiz generation.
    
    Request Body:
    {
        "subject": "Colors",
        "topic": "Rainbow colors",
        "difficulty": "Medium"
    }
    """
    try:
        data = request.get_json()
        
        result = generate_gemini_response(
            subject=data.get('subject'),
            topic=data.get('topic'),
            difficulty=data.get('difficulty', 'Medium'),
            request_type='quiz'
        )
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@gemini_bp.route('/api/gemini/motivate', methods=['POST'])
def motivate_student():
    """
    Quick endpoint for motivation messages.
    
    Request Body:
    {
        "subject": "Alphabets",
        "topic": "ABCD learning",
        "score": 75,              // Optional
        "context": "custom text"  // Optional
    }
    """
    try:
        data = request.get_json()
        
        context = {}
        if 'score' in data:
            context['score'] = data['score']
        if 'context' in data:
            context['context'] = data['context']
        
        result = generate_gemini_response(
            subject=data.get('subject', 'Learning'),
            topic=data.get('topic', 'studying'),
            difficulty='Medium',
            request_type='motivation',
            context=context if context else None
        )
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@gemini_bp.route('/api/gemini/teacher-help', methods=['POST'])
def get_teacher_suggestions():
    """
    Quick endpoint for teacher content suggestions.
    
    Request Body:
    {
        "subject": "Plants",
        "topic": "Parts of plants",
        "difficulty": "Medium"
    }
    """
    try:
        data = request.get_json()
        
        result = generate_gemini_response(
            subject=data.get('subject'),
            topic=data.get('topic'),
            difficulty=data.get('difficulty', 'Medium'),
            request_type='teacher_help'
        )
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
