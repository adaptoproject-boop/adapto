from flask import Blueprint, request, jsonify
from config.db import connect_db
from middleware.auth_middleware import token_required

user_routes = Blueprint('user_routes', __name__)
supabase = connect_db()

@user_routes.route('/progress', methods=['GET'])
@token_required
def get_student_progress():
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    if request.user['role'] not in ['parent', 'teacher']:
        return jsonify({'message': 'Unauthorized access'}), 403

    try:
        res = supabase.table('users').select('*').eq('role', 'kid').execute()
        students = res.data
        progress_data = []

        for student in students:
            # Get stats for this student
            quiz_res = supabase.table('quiz_results').select('*').eq('user_id', student['id']).execute()
            quizzes = quiz_res.data
            
            avg_score = 0
            if quizzes:
                total_percentage = sum([(q['score'] / q['total_questions']) * 100 for q in quizzes if q.get('total_questions', 0) > 0])
                avg_score = round(total_percentage / len(quizzes), 2)

            progress_data.append({
                '_id': student['id'],
                'name': student['name'],
                'level': student['level'],
                'points': student.get('points', 0),
                'stars': student.get('stars', 0),
                'totalQuizzes': len(quizzes),
                'avgScore': avg_score
            })

        return jsonify(progress_data)

    except Exception as e:
        return jsonify({'message': str(e)}), 500

@user_routes.route('/my-progress', methods=['GET'])
@token_required
def get_my_progress():
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    try:
        user_id = request.user['id']
        res = supabase.table('users').select('*').eq('id', user_id).execute()
        if not res.data:
            return jsonify({'message': 'User not found'}), 404
        user = res.data[0]
        print(f"[Debug] User found: {user['name']}")

        # Get all quiz results
        print(f"[Debug] Fetching results for user_id: {user_id}")
        quiz_res = supabase.table('quiz_results').select('*').eq('user_id', user_id).order('timestamp', desc=True).execute()
        quiz_results = quiz_res.data
        print(f"[Debug] Raw quiz results count: {len(quiz_results)}")
        
        formatted_results = []
        for i, result in enumerate(quiz_results):
            try:
                formatted_results.append({
                    'id': result['id'],
                    'lessonId': result.get('lesson_id'),
                    'lessonTitle': result.get('lesson_title', 'Unknown Lesson'),
                    'subject': result.get('subject', 'General'),
                    'quizScore': result.get('score') or 0,
                    'totalQuestions': result.get('total_questions') or 0,
                    'passed': result.get('passed', False),
                    'starsEarned': result.get('stars_earned') or 0,
                    'timestamp': result.get('timestamp')
                })
            except Exception as loop_e:
                print(f"[Debug] Error in result loop at index {i}: {loop_e}, data: {result}")
                raise loop_e

        total_stars = user.get('stars') or 0
        calculated_stars = sum(r['stars_earned'] for r in formatted_results)
        
        # Derive completed lessons from quiz results
        derived_completed = list(set(r['lessonId'] for r in formatted_results if r['passed'] and r.get('lessonId')))

        print(f"[Debug] Stars: {total_stars} (total), {calculated_stars} (calc)")
        print(f"[Debug] Completed lessons count: {len(derived_completed)}")

        response_data = {
            'userId': user['id'],
            'name': user['name'],
            'totalStars': int(max(total_stars, calculated_stars)),
            'points': user.get('points', 0),
            'badges': user.get('badges', []),
            'currentLevels': {
                "Language Basics": user.get('level', 'easy'),
                "Numbers & Math": user.get('level', 'easy'),
                "Logical Thinking": user.get('level', 'easy'),
                "Environment & Nature": user.get('level', 'easy'),
                "Shapes & Colors": user.get('level', 'easy'),
                "General Awareness": user.get('level', 'easy')
            },
            'completedLessons': derived_completed,
            'lessonResults': formatted_results,
            'currentEmotion': 'happy'
        }

        return jsonify(response_data), 200

    except Exception as e:
        import traceback
        print(f"Error fetching my progress: {e}")
        traceback.print_exc()
        return jsonify({'message': str(e), 'trace': traceback.format_exc()}), 500

@user_routes.route('/community-stats', methods=['GET'])
def get_community_stats_route():
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        user_res = supabase.table('users').select('id', count='exact').in_('role', ['kid', 'student']).execute()
        total_students = user_res.count if user_res.count is not None else 0
        
        quiz_res = supabase.table('quiz_results').select('score').execute()
        scores = [r['score'] for r in quiz_res.data]
        average_score = round(sum(scores) / len(scores), 1) if scores else 0
        
        return jsonify({
            'totalStudents': total_students,
            'averageScore': average_score
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
