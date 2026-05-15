"""
YouTube Routes
API endpoints for YouTube video recommendations
"""

from flask import Blueprint, request, jsonify
from models.youtube_model import (
    get_youtube_videos, 
    get_available_subjects, 
    get_topics_for_subject
)

youtube_bp = Blueprint('youtube', __name__)


@youtube_bp.route('/videos', methods=['POST'])
def fetch_youtube_videos():
    """
    Fetch YouTube videos based on subject, topic, difficulty, and content type.
    
    Request Body:
    {
        "subject": "Alphabets",
        "topic": "ABCD learning",
        "difficulty": "Easy",  // Optional: "Easy", "Medium", "Hard"
        "content_type": "Fun",  // Optional: "Fun", "Explanation", "Standard"
        "max_results": 3  // Optional: default 3
    }
    
    Response:
    {
        "subject": "Alphabets",
        "topic": "ABCD learning",
        "difficulty": "Easy",
        "content_type": "Fun",
        "query": "ABCD learning for kids basic song",
        "videos": [
            {
                "videoId": "abc123",
                "title": "ABCD Song for Kids",
                "thumbnail": "https://...",
                "embedUrl": "https://www.youtube.com/embed/abc123"
            }
        ]
    }
    """
    try:
        data = request.get_json()
        
        # Required fields
        subject = data.get('subject')
        topic = data.get('topic')
        
        if not subject or not topic:
            return jsonify({
                'error': 'Missing required fields: subject and topic'
            }), 400
        
        # Optional fields with defaults
        difficulty = data.get('difficulty', 'Medium')
        content_type = data.get('content_type', 'Standard')
        max_results = data.get('max_results', 3)
        
        # Fetch videos
        result = get_youtube_videos(
            subject=subject,
            topic=topic,
            difficulty=difficulty,
            content_type=content_type,
            max_results=max_results
        )
        
        # Check for errors
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500


@youtube_bp.route('/subjects', methods=['GET'])
def list_subjects():
    """
    Get list of all available subjects.
    
    Response:
    {
        "subjects": ["Alphabets", "Numbers", "Colors", "Plants", "Flowers"]
    }
    """
    try:
        subjects = get_available_subjects()
        return jsonify({
            'subjects': subjects
        }), 200
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500


@youtube_bp.route('/topics/<subject>', methods=['GET'])
def list_topics(subject):
    """
    Get all topics for a specific subject.
    
    URL Parameter:
        subject: Subject name (e.g., "Alphabets")
    
    Response:
    {
        "subject": "Alphabets",
        "topics": [
            "ABCD learning",
            "A for Apple B for Ball",
            "Alphabet pronunciation",
            "Alphabet songs for kids"
        ]
    }
    """
    try:
        topics = get_topics_for_subject(subject)
        
        if not topics:
            return jsonify({
                'error': f'Subject "{subject}" not found or has no topics'
            }), 404
        
        return jsonify({
            'subject': subject,
            'topics': topics
        }), 200
    
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500
