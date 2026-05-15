from flask import Blueprint, request, jsonify
from config.db import connect_db
from middleware.auth_middleware import token_required
import datetime

lesson_routes = Blueprint('lesson_routes', __name__)
supabase = connect_db()

@lesson_routes.route('', methods=['GET'])
@token_required
def get_lessons():
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        # Assuming lessons are in study_materials table now
        res = supabase.table('study_materials').select('*').eq('difficulty', request.user.get('level', 'easy').capitalize()).execute()
        lessons = res.data
        for lesson in lessons:
            lesson['_id'] = lesson['id']
        return jsonify(lessons)
    except Exception as error:
        return jsonify({'message': str(error)}), 500

@lesson_routes.route('/<lesson_id>', methods=['GET'])
@token_required
def get_lesson_by_id(lesson_id):
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        res = supabase.table('study_materials').select('*').eq('id', lesson_id).execute()
        if res.data:
            lesson = res.data[0]
            lesson['_id'] = lesson['id']
            return jsonify(lesson)
        else:
            return jsonify({'message': 'Lesson not found'}), 404
    except Exception as error:
        return jsonify({'message': str(error)}), 500

@lesson_routes.route('/progress', methods=['POST'])
@token_required
def update_progress():
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
    data = request.get_json()
    lesson_id = data.get('lessonId')
    status = data.get('status')
    
    try:
        user_id = request.user['id']
        # Use learning_logs or a dedicated progress table if needed
        supabase.table('learning_logs').insert({
            'user_id': user_id,
            'topic': str(lesson_id),
            'emotion': f"Status: {status}",
            'timestamp': datetime.datetime.utcnow().isoformat()
        }).execute()
        
        return jsonify({'message': 'Progress updated successfully'}), 201
    except Exception as error:
        return jsonify({'message': str(error)}), 500
