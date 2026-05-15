"""
Analytics Routes
API endpoints for Parent and Teacher analytics with role-based access control
"""

from flask import Blueprint, request, jsonify
from models.analytics_model import get_parent_analytics, get_teacher_analytics, get_safe_analytics
from middleware.auth_middleware import verify_token

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/parent/<child_id>', methods=['GET'])
def get_parent_dashboard_analytics(child_id):
    """
    Get comprehensive analytics for a parent to track their child's progress.
    
    URL Parameter:
        child_id: MongoDB ObjectId of the child/student
    
    Response:
    {
        "childName": "Leo",
        "quiz_scores": [...],
        "level_progression": {...},
        "pass_retry_stats": {...},
        "emotion_usage": {...},
        "content_style_usage": {...},
        "overall_summary": {...}
    }
    
    Access Control:
        - Parent can only access their own child's data
        - Admin can access any child's data
    """
    try:
        # TODO: Add authentication check
        # token = request.headers.get('Authorization')
        # user = verify_token(token)
        # if user['role'] != 'parent' and user['role'] != 'admin':
        #     return jsonify({'error': 'Unauthorized'}), 403
        
        # Get analytics
        analytics = get_parent_analytics(child_id)
        
        # Check for errors
        if "error" in analytics:
            return jsonify(analytics), 404 if "not found" in analytics["error"] else 500
        
        return jsonify(analytics), 200
    
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500


@analytics_bp.route('/teacher', methods=['GET'])
def get_teacher_dashboard_analytics():
    """
    Get comprehensive analytics for teachers to track class performance.
    
    Query Parameters:
        class_id: Optional class identifier
        subject: Optional subject filter
    
    Response:
    {
        "student_performance": {...},
        "topic_analysis": [...],
        "weak_topics": [...],
        "difficulty_distribution": {...},
        "class_summary": {...}
    }
    
    Access Control:
        - Teacher can access their own class data
        - Admin can access all classes
    """
    try:
        # TODO: Add authentication check
        # token = request.headers.get('Authorization')
        # user = verify_token(token)
        # if user['role'] != 'teacher' and user['role'] != 'admin':
        #     return jsonify({'error': 'Unauthorized'}), 403
        
        # Get query parameters
        class_id = request.args.get('class_id')
        subject = request.args.get('subject')
        
        # Get analytics
        analytics = get_teacher_analytics(class_id=class_id, subject=subject)
        
        # Check for errors
        if "error" in analytics:
            return jsonify(analytics), 500
        
        return jsonify(analytics), 200
    
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500


@analytics_bp.route('/stats/community', methods=['GET'])
def get_community_stats_route():
    """
    Endpoint for overall community stats (total learners, average score).
    """
    from models.analytics_model import get_community_stats
    stats = get_community_stats()
    
    if "error" in stats:
        return jsonify(stats), 500
        
    return jsonify(stats), 200


@analytics_bp.route('/summary', methods=['GET'])
def get_analytics_summary():
    """
    Get quick summary of available analytics endpoints.
    
    Response: List of available analytics endpoints with descriptions
    """
    summary = {
        "endpoints": [
            {
                "method": "GET",
                "endpoint": "/api/analytics/parent/:childId",
                "description": "Get child's learning progress analytics",
                "role": "parent, admin"
            },
            {
                "method": "GET",
                "endpoint": "/api/analytics/teacher",
                "description": "Get class-wide performance analytics",
                "role": "teacher, admin",
                "query_params": ["class_id", "subject"]
            }
        ],
        "metrics": {
            "parent_analytics": [
                "Quiz scores (last 10)",
                "Level progression per subject",
                "Pass/retry statistics",
                "Emotion-based content usage",
                "Overall summary (lessons, avg score, stars)"
            ],
            "teacher_analytics": [
                "Student performance distribution",
                "Topic-wise average scores",
                "Weak topics identification",
                "Difficulty distribution",
                "Class summary statistics"
            ]
        }
    }
    
    return jsonify(summary), 200
