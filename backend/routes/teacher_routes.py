"""
Teacher Routes - API Endpoints for Teacher Panel
Allows teachers to manage students, study materials, quizzes, and view analytics
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import re
from config.db import connect_db

teacher_bp = Blueprint('teacher', __name__)
supabase = connect_db()

# ==================================================
# VALIDATION HELPERS
# ==================================================

def validate_youtube_url(url):
    youtube_regex = r'^(https?://)?(www\.)?(youtube\.com|youtu\.be)/.+'
    return re.match(youtube_regex, url) is not None

def validate_subject(subject):
    allowed_subjects = ['Alphabets', 'Numbers', 'Colors', 'Shapes', 'Plants', 'Flowers']
    return subject in allowed_subjects

def validate_difficulty(difficulty):
    allowed_levels = ['Easy', 'Medium', 'Hard']
    return difficulty in allowed_levels

def validate_content_type(content_type):
    allowed_types = ['Fun', 'Explanation', 'Standard']
    return content_type in allowed_types

# ==================================================
# STUDENT MANAGEMENT
# ==================================================

@teacher_bp.route('/students', methods=['GET'])
def get_all_students():
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    try:
        # Get all users with role 'kid' or 'student'
        result = supabase.table('users').select('id, name, email, role, stars, points, level').in_('role', ['kid', 'student']).execute()
        students = result.data
        
        for student in students:
            # Map id to _id for frontend compatibility
            student['_id'] = student['id']
            
            # Count distinct completed lessons from quiz_results
            quiz_res = supabase.table('quiz_results').select('lesson_id').eq('user_id', student['id']).eq('passed', True).execute()
            completed_lessons = set(r['lesson_id'] for r in quiz_res.data)
            student['completedLessons'] = len(completed_lessons)
            
            # Aggregate Total Stars from quiz results
            stars_res = supabase.table('quiz_results').select('stars_earned').eq('user_id', student['id']).execute()
            aggregated_stars = sum(r['stars_earned'] for r in stars_res.data)
            student['totalStars'] = aggregated_stars if aggregated_stars > 0 else student.get('stars', 0)
        
        return jsonify({'students': students}), 200
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@teacher_bp.route('/student-progress/<student_id>', methods=['GET'])
def get_student_progress(student_id):
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    try:
        # Get student info
        result = supabase.table('users').select('*').eq('id', student_id).execute()
        if not result.data:
            return jsonify({'error': 'Student not found'}), 404
            
        student = result.data[0]
        student['_id'] = student['id']
        student.pop('password', None)
        
        # Get all quiz results for this student
        quiz_res = supabase.table('quiz_results').select('*').eq('user_id', student_id).order('timestamp', desc=True).execute()
        quiz_results = quiz_res.data
        
        for result in quiz_results:
            result['_id'] = result['id']
            result['userId'] = result['user_id']
            # timestamp is already in ISO format from Supabase
        
        # Calculate subject-wise progress
        subject_progress = {}
        for result in quiz_results:
            subject = result.get('subject', result.get('lesson_title', 'Unknown'))
            if subject not in subject_progress:
                subject_progress[subject] = {
                    'total_quizzes': 0,
                    'passed': 0,
                    'average_score': 0,
                    'current_level': result.get('level', 'Easy')
                }
            
            subject_progress[subject]['total_quizzes'] += 1
            if result.get('passed', False):
                subject_progress[subject]['passed'] += 1
        
        # Calculate average scores per subject
        for subject in subject_progress:
            subject_quizzes = [r for r in quiz_results if r.get('subject', r.get('lesson_title')) == subject]
            if subject_quizzes:
                avg = sum(r.get('score', 0) for r in subject_quizzes) / len(subject_quizzes)
                subject_progress[subject]['average_score'] = round(avg, 1)
        
        # Overall stats
        total_quizzes = len(quiz_results)
        passed_quizzes = sum(1 for r in quiz_results if r.get('passed', False))
        avg_score = sum(r.get('score', 0) for r in quiz_results) / total_quizzes if total_quizzes > 0 else 0
        
        # Calculate Total Study Time (Average Response Time * Total Questions)
        total_time_seconds = sum(r.get('average_response_time', 0) * r.get('total_questions', 1) for r in quiz_results)
        
        overall_stats = {
            'total_quizzes_taken': total_quizzes,
            'quizzes_passed': passed_quizzes,
            'pass_rate': round((passed_quizzes / total_quizzes * 100) if total_quizzes > 0 else 0, 1),
            'average_score': round(avg_score, 1),
            'total_stars': student.get('stars', 0),
            'completed_lessons': student.get('completedLessons', 0),
            'total_study_time_mins': round(total_time_seconds / 60, 1)
        }
        
        # Emotion Timeline (last 20 logs)
        emotion_timeline = []
        for r in quiz_results[:20]:
            emotion_timeline.append({
                'timestamp': r.get('timestamp'),
                'emotion': r.get('emotion', 'neutral'),
                'score': r.get('score', 0),
                'topic': r.get('lesson_title', 'General')
            })
        
        return jsonify({
            'student': student,
            'quiz_results': quiz_results[:10],
            'subject_progress': subject_progress,
            'overall_stats': overall_stats,
            'emotion_timeline': emotion_timeline
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# ==================================================
# STUDY MATERIAL MANAGEMENT
# ==================================================

@teacher_bp.route('/add-study-material', methods=['POST'])
def add_study_material():
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    try:
        data = request.get_json()
        required_fields = ['subject', 'topic', 'difficulty', 'content_type', 'youtube_url']
        missing_fields = [f for f in required_fields if f not in data]
        
        if missing_fields:
            return jsonify({'error': f'Missing fields: {", ".join(missing_fields)}'}), 400
        
        if not validate_youtube_url(data['youtube_url']):
            return jsonify({'error': 'Invalid YouTube URL format'}), 400
        
        material = {
            'subject': data['subject'],
            'topic': data['topic'].strip(),
            'difficulty': data['difficulty'],
            'content_type': data['content_type'],
            'youtube_url': data['youtube_url'],
            'description': data.get('description', '').strip(),
            'created_by': data.get('teacher_id', 'teacher'),
            'status': 'active'
        }
        
        result = supabase.table('study_materials').insert(material).execute()
        new_material = result.data[0]
        new_material['_id'] = new_material['id']
        
        return jsonify({
            'message': 'Study material added successfully',
            'material': new_material
        }), 201
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@teacher_bp.route('/study-materials', methods=['GET'])
def get_study_materials():
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    try:
        query = supabase.table('study_materials').select('*').eq('status', 'active')
        
        subject_filter = request.args.get('subject')
        if subject_filter:
            query = query.eq('subject', subject_filter)
        
        difficulty_filter = request.args.get('difficulty')
        if difficulty_filter:
            query = query.eq('difficulty', difficulty_filter)
        
        result = query.order('created_at', desc=True).execute()
        materials = result.data
        
        for material in materials:
            material['_id'] = material['id']
        
        return jsonify({'materials': materials}), 200
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@teacher_bp.route('/study-material/<material_id>', methods=['PUT'])
def update_study_material(material_id):
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    try:
        data = request.get_json()
        
        # Validate if URL provided
        if 'youtube_url' in data and not validate_youtube_url(data['youtube_url']):
            return jsonify({'error': 'Invalid YouTube URL format'}), 400
            
        result = supabase.table('study_materials').update(data).eq('id', material_id).execute()
        if not result.data:
            return jsonify({'error': 'Material not found'}), 404
            
        return jsonify({
            'message': 'Study material updated successfully',
            'material': result.data[0]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@teacher_bp.route('/study-material/<material_id>', methods=['DELETE'])
def delete_study_material(material_id):
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    try:
        result = supabase.table('study_materials').update({'status': 'inactive'}).eq('id', material_id).execute()
        if not result.data:
            return jsonify({'error': 'Material not found'}), 404
        
        return jsonify({'message': 'Study material deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# ==================================================
# QUIZ MANAGEMENT
# ==================================================

@teacher_bp.route('/create-quiz', methods=['POST'])
def create_quiz():
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    try:
        data = request.get_json()
        required_fields = ['subject', 'topic', 'difficulty', 'questions']
        
        if any(f not in data for f in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        quiz = {
            'subject': data['subject'],
            'topic': data['topic'].strip(),
            'difficulty': data['difficulty'],
            'questions': data['questions'],
            'created_by': data.get('teacher_id', 'teacher'),
            'status': 'active'
        }
        
        result = supabase.table('quizzes').insert(quiz).execute()
        new_quiz = result.data[0]
        new_quiz['_id'] = new_quiz['id']
        
        return jsonify({
            'message': 'Quiz created successfully',
            'quiz': new_quiz
        }), 201
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@teacher_bp.route('/quizzes', methods=['GET'])
def get_quizzes():
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    try:
        result = supabase.table('quizzes').select('*').eq('status', 'active').order('created_at', desc=True).execute()
        quizzes = result.data
        
        for quiz in quizzes:
            quiz['_id'] = quiz['id']
        
        return jsonify({'quizzes': quizzes}), 200
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# ==================================================
# TEACHER ACTIONS
# ==================================================

@teacher_bp.route('/assign-remedial', methods=['POST'])
def assign_remedial():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        lesson_id = data.get('lesson_id')
        
        if not student_id or not lesson_id:
            return jsonify({'error': 'student_id and lesson_id are required'}), 400
            
        # For now, we can add a flag to the user's data or create a 'recommendations' table
        # Let's just return success for the UI prototype
        return jsonify({'message': f'Remedial lesson {lesson_id} assigned to student {student_id}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/notify-parent', methods=['POST'])
def notify_parent():
    from config.mail import mail
    from flask_mail import Message
    
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        message_text = data.get('message', 'Your child is doing great! Keep up the good work.')
        
        # Get parent/student email
        res = supabase.table('users').select('email, name').eq('id', student_id).execute()
        if not res.data:
            return jsonify({'error': 'Student not found'}), 404
            
        student_email = res.data[0]['email']
        student_name = res.data[0]['name']
        
        # In a real app, we'd find the parent's email. Here we'll just mock sending to student's email
        # msg = Message(f"Progress Update for {student_name}", recipients=[student_email])
        # msg.body = message_text
        # mail.send(msg)
        
        return jsonify({'message': f'Notification sent to parent of {student_name}'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================================================
# TEACHER ANALYTICS
# ==================================================

@teacher_bp.route('/analytics', methods=['GET'])
def get_teacher_analytics():
    if not supabase:
        return jsonify({'error': 'Database connection failed'}), 500
        
    try:
        # 1. Fetch Quiz Results (Legacy/Core)
        res = supabase.table('quiz_results').select('*').execute()
        quiz_results = res.data
        
        if not quiz_results:
            return jsonify({
                "student_performance": {},
                "topic_analysis": [],
                "weak_topics": [],
                "difficulty_distribution": {"easy": 0, "medium": 0, "hard": 0},
                "class_summary": {
                    "total_students": 0,
                    "total_quizzes_taken": 0,
                    "average_class_score": 0,
                    "pass_rate": 0
                }
            }), 200

        # 1. Student Performance
        student_scores = {}
        for result in quiz_results:
            user_id = str(result.get("user_id", "unknown"))
            score = result.get("score", 0)
            if user_id not in student_scores:
                student_scores[user_id] = []
            student_scores[user_id].append(score)
        
        student_performance = {}
        for user_id, scores in student_scores.items():
            avg = sum(scores) / len(scores) if scores else 0
            student_performance[user_id] = {
                "average_score": round(avg, 1),
                "total_quizzes": len(scores)
            }
        
        # 2. Topic Analysis
        topic_scores = {}
        for result in quiz_results:
            lesson = result.get("lesson_title", result.get("subject", "General")) 
            score = result.get("score", 0)
            if lesson not in topic_scores:
                topic_scores[lesson] = []
            topic_scores[lesson].append(score)
        
        topic_analysis = []
        for lesson, scores in topic_scores.items():
            avg_score = sum(scores) / len(scores) if scores else 0
            topic_analysis.append({
                "topic": lesson,
                "average_score": round(avg_score, 1),
                "attempts": len(scores)
            })
        
        topic_analysis.sort(key=lambda x: x["average_score"])
        weak_topics = [t for t in topic_analysis if t["average_score"] < 60]
        
        # 3. Difficulty Distribution
        difficulty_distribution = {"easy": 0, "medium": 0, "hard": 0}
        for result in quiz_results:
            level = (result.get("level") or "easy").lower()
            if level in difficulty_distribution:
                difficulty_distribution[level] += 1
        
        # 4. Class Summary
        user_res = supabase.table('users').select('id', count='exact').in_('role', ['kid', 'student']).execute()
        total_students_count = user_res.count if user_res.count is not None else 0
        
        total_quizzes = len(quiz_results)
        avg_class_score = sum(r.get("score", 0) for r in quiz_results) / total_quizzes if total_quizzes > 0 else 0
        passed_count = sum(1 for r in quiz_results if r.get("passed", False))
        class_pass_rate = (passed_count / total_quizzes * 100) if total_quizzes > 0 else 0
        
        # 5. Active Today
        today = datetime.now().strftime('%Y-%m-%d')
        active_today_count = len(set(r.get('user_id') for r in quiz_results if r.get('timestamp') and r.get('timestamp').startswith(today)))
        
        # 6. Struggling Students
        struggling_students = []
        for u_id, stats in student_performance.items():
            if stats['average_score'] < 60:
                user_res = supabase.table('users').select('name').eq('id', u_id).execute()
                name = user_res.data[0]['name'] if user_res.data else "Unknown"
                struggling_students.append({
                    'id': u_id,
                    'name': name,
                    'score': stats['average_score'],
                    'reason': 'Low average score'
                })
        
        # 7. ADAPTO Adaptive Insights (using quiz_results now as it has the same signals)
        adaptive_insights = {
            "avg_confused_ratio": 0.0,
            "avg_retries": 0.0,
            "avg_pace": 0.85, # Default steady pace
            "total_adaptive_sessions": len(quiz_results)
        }
        if quiz_results:
            adaptive_insights["avg_confused_ratio"] = round(sum(s.get("confused_ratio", 0) for s in quiz_results) / len(quiz_results), 2)
            adaptive_insights["avg_retries"]        = round(sum(s.get("retries", 0) for s in quiz_results) / len(quiz_results), 1)

        return jsonify({
            "student_performance": student_performance,
            "topic_analysis": topic_analysis,
            "weak_topics": weak_topics,
            "difficulty_distribution": difficulty_distribution,
            "adaptive_insights": adaptive_insights,
            "struggling_students": struggling_students[:5],
            "class_summary": {
                "total_students": total_students_count,
                "total_quizzes_taken": total_quizzes,
                "average_class_score": round(avg_class_score, 1),
                "pass_rate": round(class_pass_rate, 1),
                "active_today": active_today_count
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500
