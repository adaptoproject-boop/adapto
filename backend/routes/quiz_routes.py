from flask import Blueprint, request, jsonify
from config.db import connect_db
from middleware.auth_middleware import token_required
import datetime
from models.gemini_model import generate_gemini_response
import json
import re

quiz_routes = Blueprint('quiz_routes', __name__)
supabase = connect_db()

@quiz_routes.route('/submit', methods=['POST'])
@token_required
def submit_quiz():
    """
    Persist quiz result to Supabase.
    NOTE: Difficulty level changes are decided ONLY by /api/learning/next-step
    (the orchestrator). This route just saves data and returns stars/badges.
    """
    if not supabase:
        return jsonify({'message': 'Database connection error'}), 500

    data = request.get_json()
    lesson_id       = data.get('lessonId')
    score           = data.get('score', 0)
    total_questions = data.get('totalQuestions', 1)
    level           = data.get('level', 'easy')
    response_times  = data.get('responseTimes', [])
    lesson_title    = data.get('lessonTitle', 'Unknown Lesson')
    subject         = data.get('subject', 'General')

    # Extended ML signals (passed from Quiz.jsx)
    streak_wrong    = int(data.get('streakWrong', 0))
    streak_correct  = int(data.get('streakCorrect', 0))
    retries         = int(data.get('retries', 0))
    video_completion = float(data.get('videoCompletion', 1.0))
    confused_ratio  = float(data.get('confusedRatio', 0.0))
    emotion         = data.get('emotion', 'neutral')

    avg_time    = sum(response_times) / len(response_times) if response_times else 0
    percentage  = (score / total_questions) * 100 if total_questions > 0 else 0
    passed      = percentage >= 50

    stars_earned = 0
    if percentage >= 90:   stars_earned = 5
    elif percentage >= 70: stars_earned = 3
    elif percentage >= 50: stars_earned = 1

    # Bonus stars for streaks
    if streak_correct >= 5: stars_earned = min(stars_earned + 2, 5)

    try:
        user_id = request.user['id']

        # ------------------------------------------------------------------
        # 1. Persist quiz result (with full ML signals for Phase B training)
        # ------------------------------------------------------------------
        quiz_result_data = {
            'user_id':               user_id,
            'lesson_id':             str(lesson_id),
            'lesson_title':          lesson_title,
            'subject':               subject,
            'score':                 score,
            'total_questions':       total_questions,
            'level':                 level,
            'passed':                passed,
            'stars_earned':          stars_earned,
            'average_response_time': avg_time,
            'emotion':               emotion,
            'streak_wrong':          streak_wrong,
            'streak_correct':        streak_correct,
            'retries':               retries,
            'video_completion':      video_completion,
            'confused_ratio':        confused_ratio,
            'timestamp':             datetime.datetime.utcnow().isoformat()
        }
        supabase.table('quiz_results').insert(quiz_result_data).execute()

        # ------------------------------------------------------------------
        # 2. Badge logic (based on completed distinct lessons)
        # ------------------------------------------------------------------
        results          = supabase.table('quiz_results').select('lesson_id').eq('user_id', user_id).eq('passed', True).execute()
        completed_lessons = set(r['lesson_id'] for r in results.data)
        num_completed    = len(completed_lessons)

        new_badges       = []
        existing_badges  = request.user.get('badges') or []

        if num_completed >= 1  and 'Star Starter'   not in existing_badges: new_badges.append('Star Starter')
        if num_completed >= 5  and 'Active Learner'  not in existing_badges: new_badges.append('Active Learner')
        if num_completed >= 10 and 'Subject Master'  not in existing_badges: new_badges.append('Subject Master')
        if avg_time < 5 and percentage >= 80 and 'Fast Learner' not in existing_badges: new_badges.append('Fast Learner')
        if streak_correct >= 5 and 'Streak Champion' not in existing_badges: new_badges.append('Streak Champion')

        # ------------------------------------------------------------------
        # 3. Update points + stars ONLY — level is set by the orchestrator
        # ------------------------------------------------------------------
        update_fields = {
            'points': (request.user.get('points') or 0) + (score * 10) + (stars_earned * 5),
            'stars':  (request.user.get('stars')  or 0) + stars_earned,
        }
        if new_badges:
            update_fields['badges'] = existing_badges + new_badges

        supabase.table('users').update(update_fields).eq('id', user_id).execute()

        # ------------------------------------------------------------------
        # 4. Build friendly message
        # ------------------------------------------------------------------
        if percentage >= 80 and avg_time < 10:
            message = 'Fast and Accurate! Challenge Up! 🚀'
        elif percentage < 50:
            message = "Good try! Let's practice some more. 💪"
        else:
            message = 'Great job! Keep it up! ⭐'

        return jsonify({
            'starsEarned': stars_earned,
            'points':      update_fields['points'],
            'stars':       update_fields['stars'],
            'newBadges':   new_badges,
            'avgTime':     avg_time,
            'passed':      passed,
            'percentage':  round(percentage, 1),
            'message':     message
        }), 201

    except Exception as error:
        print(f"Error submitting quiz: {error}")
        return jsonify({'message': str(error)}), 500

@quiz_routes.route('/generate', methods=['POST'])
@token_required
def generate_quiz():
    try:
        data = request.json
        subject = data.get('subject')
        topic = data.get('topic')
        difficulty = data.get('difficulty', request.user.get('level', 'easy')).capitalize()

        if not subject or not topic:
            return jsonify({"error": "Subject and topic are required"}), 400

        print(f"Generating AI quiz for: {subject} - {topic} ({difficulty})")

        ai_response = generate_gemini_response(
            subject=subject,
            topic=topic,
            request_type="quiz",
            difficulty=difficulty
        )

        if "error" in ai_response or ai_response.get("is_fallback"):
            if ai_response.get("content"):
                quiz_data = ai_response["content"]
            else:
                return jsonify({"error": ai_response["error"]}), 500
        else:
            quiz_data = ai_response.get("content", [])

        if isinstance(quiz_data, str):
            clean_json = quiz_data.replace('```json', '').replace('```', '').strip()
            match = re.search(r'(\[.*\]|\{.*\})', clean_json, re.DOTALL)
            if match:
                clean_json = match.group(1)
            try:
                quiz_data = json.loads(clean_json)
            except:
                return jsonify({"error": "Failed to parse AI quiz response"}), 500

        return jsonify({
            "success": True,
            "subject": subject,
            "topic": topic,
            "questions": quiz_data
        })

    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({"error": str(e)}), 500

@quiz_routes.route('/recommendation', methods=['GET'])
@token_required
def get_recommendation():
    if not supabase:
        return jsonify({'message': 'Database connection error'}), 500
        
    try:
        user_id = request.user['id']
        # Get completed lessons
        results = supabase.table('quiz_results').select('lesson_id').eq('user_id', user_id).execute()
        completed_lesson_ids = [r['lesson_id'] for r in results.data]
        
        # This part depends on how lessons are stored. 
        # In the new custom model setup, we don't have a lessons table in DB yet.
        # For now, return a message or implement a simple check if needed.
        return jsonify({'message': 'Continue exploring topics!'})
    except Exception as error:
        return jsonify({'message': str(error)}), 500
