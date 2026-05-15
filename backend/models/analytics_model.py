"""
Analytics Model - Read-Only Data Analysis for E-Learning Platform
"""

import os
from datetime import datetime, timedelta
from config.db import connect_db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ==================================================
# PARENT ANALYTICS
# ==================================================

def get_parent_analytics(child_id):
    """
    Generate comprehensive analytics for a parent to track their child's progress.
    """
    supabase = connect_db()
    if supabase is None:
        return {"error": "Database connection failed"}
    
    try:
        # Get user info
        result = supabase.table('users').select('*').eq('id', child_id).execute()
        if not result.data:
            return {"error": "Child not found"}
        user = result.data[0]
        
        # Get all quiz results for this child
        quiz_res = supabase.table('quiz_results').select('*').eq('user_id', child_id).order('timestamp', desc=True).execute()
        quiz_results = quiz_res.data
        
        # 1. Quiz Scores (last 10 quizzes)
        quiz_scores = []
        for r in quiz_results[:10]:
            quiz_scores.append({
                "lesson": r.get("lesson_title", "Unknown"),
                "score": r.get("score", 0),
                "date": r.get("timestamp")[:10] if r.get("timestamp") else "N/A",
                "passed": r.get("passed", False),
                "starsEarned": r.get("stars_earned", 0)
            })
        
        # 2. Level Progression (subject-wise)
        level_progression = {}
        for r in quiz_results:
            subject = r.get("subject", "Unknown")
            if subject not in level_progression:
                level_progression[subject] = []
            level_progression[subject].append({
                "date": r.get("timestamp")[:10] if r.get("timestamp") else "N/A",
                "level": r.get("level", "easy"),
                "score": r.get("score", 0)
            })
        
        # 3. Pass/Retry Stats
        total_quizzes = len(quiz_results)
        passed_quizzes = sum(1 for r in quiz_results if r.get("passed", False))
        pass_rate = (passed_quizzes / total_quizzes * 100) if total_quizzes > 0 else 0
        
        # 4. Emotion-Based Content Usage
        emotion_usage = {}
        content_style_usage = {}
        
        for r in quiz_results:
            emotion = r.get("emotion", "neutral")
            content_style = r.get("content_type", "Standard")
            
            emotion_usage[emotion] = emotion_usage.get(emotion, 0) + 1
            content_style_usage[content_style] = content_style_usage.get(content_style, 0) + 1
        
        # 5. Overall Summary
        avg_score = sum(r.get("score", 0) for r in quiz_results) / total_quizzes if total_quizzes > 0 else 0
        total_stars = user.get("stars", 0)
        
        # Calculate completed lessons from quiz results
        completed_lessons = len(set(r['lesson_id'] for r in quiz_results if r.get('passed')))
        
        return {
            "childName": user.get("name", "Unknown"),
            "quiz_scores": quiz_scores,
            "level_progression": level_progression,
            "pass_retry_stats": {
                "total_quizzes": total_quizzes,
                "passed": passed_quizzes,
                "retries": total_quizzes - passed_quizzes,
                "pass_rate": round(pass_rate, 1)
            },
            "emotion_usage": emotion_usage,
            "content_style_usage": content_style_usage,
            "overall_summary": {
                "total_lessons_completed": completed_lessons,
                "average_score": round(avg_score, 1),
                "total_stars_earned": total_stars,
                "current_level": user.get("level", "easy")
            }
        }
    
    except Exception as e:
        print(f"Parent analytics error: {e}")
        return {"error": f"Analytics generation failed: {str(e)}"}

# ==================================================
# TEACHER ANALYTICS
# ==================================================

def get_teacher_analytics(class_id=None, subject=None):
    """
    Generate comprehensive analytics for teachers to track class performance.
    """
    supabase = connect_db()
    if supabase is None:
        return {"error": "Database connection failed"}
    
    try:
        query = supabase.table('quiz_results').select('*')
        if subject:
            query = query.eq('subject', subject)
            
        res = query.execute()
        quiz_results = res.data
        
        if not quiz_results:
            return get_default_analytics("teacher")
        
        # 1. Student Performance Distribution
        student_scores = {}
        for r in quiz_results:
            u_id = r.get("user_id", "unknown")
            score = r.get("score", 0)
            if u_id not in student_scores:
                student_scores[u_id] = []
            student_scores[u_id].append(score)
        
        student_performance = {}
        for u_id, scores in student_scores.items():
            avg = sum(scores) / len(scores) if scores else 0
            student_performance[u_id] = {
                "average_score": round(avg, 1),
                "total_quizzes": len(scores)
            }
        
        # 2. Topic Analysis
        topic_scores = {}
        for r in quiz_results:
            lesson = r.get("lesson_title", "Unknown")
            score = r.get("score", 0)
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
        for r in quiz_results:
            level = (r.get("level") or "easy").lower()
            if level in difficulty_distribution:
                difficulty_distribution[level] += 1
        
        # 4. Class Summary
        total_students = len(student_scores)
        total_quizzes = len(quiz_results)
        avg_class_score = sum(r.get("score", 0) for r in quiz_results) / total_quizzes if total_quizzes > 0 else 0
        passed_count = sum(1 for r in quiz_results if r.get("passed", False))
        class_pass_rate = (passed_count / total_quizzes * 100) if total_quizzes > 0 else 0
        
        return {
            "student_performance": student_performance,
            "topic_analysis": topic_analysis,
            "weak_topics": weak_topics,
            "difficulty_distribution": difficulty_distribution,
            "class_summary": {
                "total_students": total_students,
                "total_quizzes_taken": total_quizzes,
                "average_class_score": round(avg_class_score, 1),
                "pass_rate": round(class_pass_rate, 1),
                "students_above_70": sum(1 for p in student_performance.values() if p["average_score"] >= 70),
                "students_below_50": sum(1 for p in student_performance.values() if p["average_score"] < 50)
            }
        }
    
    except Exception as e:
        print(f"Teacher analytics error: {e}")
        return {"error": f"Analytics generation failed: {str(e)}"}

# ==================================================
# HELPER FUNCTIONS
# ==================================================

def get_safe_analytics(analytics_type, user_id):
    if analytics_type == "parent":
        analytics = get_parent_analytics(user_id)
    elif analytics_type == "teacher":
        analytics = get_teacher_analytics(user_id)
    else:
        return {"error": "Invalid analytics type"}
    
    if "error" in analytics:
        return get_default_analytics(analytics_type)
    
    return analytics

def get_community_stats():
    supabase = connect_db()
    if supabase is None:
        return {"error": "Database connection failed"}
    
    try:
        user_res = supabase.table('users').select('id', count='exact').in_('role', ['kid', 'student']).execute()
        total_students = user_res.count if user_res.count is not None else 0
        
        quiz_res = supabase.table('quiz_results').select('score').execute()
        scores = [r['score'] for r in quiz_res.data]
        average_score = round(sum(scores) / len(scores), 1) if scores else 0
        
        return {
            'totalStudents': total_students,
            'averageScore': average_score
        }
    except Exception as e:
        print(f"Community stats error: {e}")
        return {"error": str(e)}

def get_default_analytics(analytics_type):
    if analytics_type == "parent":
        return {
            "message": "No learning data available yet. Start learning to see analytics!",
            "quiz_scores": [],
            "level_progression": {},
            "pass_retry_stats": {"total_quizzes": 0, "passed": 0, "retries": 0, "pass_rate": 0},
            "emotion_usage": {},
            "content_style_usage": {},
            "overall_summary": {"total_lessons_completed": 0, "average_score": 0, "total_stars_earned": 0}
        }
    else:
        return {
            "message": "No class data available yet",
            "student_performance": {},
            "topic_analysis": [],
            "weak_topics": [],
            "difficulty_distribution": {"easy": 0, "medium": 0, "hard": 0},
            "class_summary": {"total_students": 0, "total_quizzes_taken": 0, "average_class_score": 0, "pass_rate": 0}
        }

def track_learning_progress(user_id, subject, topic, quiz_score, emotion,
                             session_data=None):
    """
    Backwards-compatible wrapper — now also writes a full session row
    to Supabase if session_data is provided.
    """
    supabase = connect_db()
    if supabase is None:
        return False

    try:
        # Legacy learning_log (keep for compatibility)
        supabase.table('learning_logs').insert({
            "user_id":    user_id,
            "subject":    subject,
            "topic":      topic,
            "quiz_score": quiz_score,
            "emotion":    emotion
        }).execute()
    except Exception as e:
        print(f"learning_logs insert error (non-fatal): {e}")

    # Rich session write if data provided
    if session_data:
        write_session(user_id, subject, topic, quiz_score, emotion, session_data)

    return True


def write_session(user_id, subject, topic, quiz_score, emotion, session_data: dict):
    """
    Persist a full ML-plan session document to Supabase `sessions` table.

    session_data expected keys (all optional, safe defaults applied):
        streak_wrong, streak_correct, retries, video_completion, confused_ratio,
        average_response_time, next_difficulty, composite_score, pace_score,
        video_completion, teacher_label
    """
    supabase = connect_db()
    if supabase is None:
        return False

    try:
        row = {
            "user_id":          user_id,
            "subject":          subject,
            "topic":            topic,
            "quiz_score":       quiz_score,
            "emotion":          emotion,
            # Quiz signals
            "streak_wrong":     session_data.get("streak_wrong", 0),
            "streak_correct":   session_data.get("streak_correct", 0),
            "retries":          session_data.get("retries", 0),
            # Pace signals
            "video_completion": session_data.get("video_completion", 1.0),
            "avg_response_time": session_data.get("average_response_time", 0),
            # Emotion signals
            "confused_ratio":   session_data.get("confused_ratio", 0.0),
            # Features (composite)
            "composite_score":  session_data.get("composite_score", 0.0),
            "pace_score":       session_data.get("pace_score", 1.0),
            # Adaptive decision
            "next_difficulty":  session_data.get("next_difficulty", "same"),
            # Phase B label (teacher sets later)
            "teacher_label":    session_data.get("teacher_label", None),
            "timestamp":        datetime.utcnow().isoformat()
        }
        supabase.table('sessions').insert(row).execute()
        return True
    except Exception as e:
        print(f"write_session error (non-fatal): {e}")
        return False


def write_emotion_log(kid_id: str, session_id: str, emotion: str):
    """
    Persist a single emotion reading to `emotion_logs` table.
    Called by /api/emotion/log every 5 seconds from frontend.
    """
    supabase = connect_db()
    if supabase is None:
        return False
    try:
        supabase.table('emotion_logs').insert({
            "kid_id":     kid_id,
            "session_id": session_id,
            "emotion":    emotion,
            "timestamp":  datetime.utcnow().isoformat()
        }).execute()
        return True
    except Exception as e:
        print(f"write_emotion_log error (non-fatal): {e}")
        return False
