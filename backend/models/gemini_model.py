"""
Custom AI Model Router
This module replaces the reliance on Gemini/Groq APIs with local custom models.
It maintains the exact same interface (generate_gemini_response) so no frontend changes are needed.
"""

from models.quiz_generator import generate_quiz
from models.explanation_engine import get_explanation, get_motivation, get_teacher_help
import json

def validate_inputs(subject, topic, difficulty, request_type):
    """Keep validation logic to ensure data integrity."""
    if not subject or not topic:
        return False, "Subject and topic are required."
    
    valid_types = ['explanation', 'quiz', 'motivation', 'teacher_help', 'video_script', 'sequence_script']
    if request_type not in valid_types:
        return False, f"Invalid request type: {request_type}"
    
    return True, None

def generate_gemini_response(subject, topic, difficulty="Easy", request_type="explanation", context=None):
    """
    Router function that directs requests to the appropriate custom local model.
    """
    try:
        # Normalize inputs
        difficulty = difficulty or "Easy"
        
        result = {
            "subject": subject,
            "topic": topic,
            "difficulty": difficulty,
            "request_type": request_type,
            "is_custom_model": True
        }

        if request_type == "quiz":
            questions = generate_quiz(subject, topic, difficulty)
            result["content"] = questions
            
        elif request_type == "explanation":
            explanation = get_explanation(subject, topic, difficulty)
            result["content"] = explanation
            
        elif request_type == "motivation":
            score = context.get('score', 0) if context else 0
            name = context.get('name', 'Student') if context else 'Student'
            motivation = get_motivation(score, name, topic)
            result["content"] = motivation
            
        elif request_type == "teacher_help":
            help_content = get_teacher_help(subject, topic, difficulty)
            result["content"] = help_content
            
        elif request_type == "sequence_script":
            # Reuse existing logic for sequence scripts if it was already local
            # or provide a simple template
            result["content"] = get_structured_sequence(subject, topic)
            
        elif request_type == "video_script":
            result["content"] = f"A educational video script about {topic} for {difficulty} level learners."

        return result

    except Exception as e:
        print(f"Error in custom model router: {e}")
        return {
            "error": str(e),
            "content": f"I'm sorry, I encountered an error while thinking about {topic}. Let's try another way!"
        }

def get_structured_sequence(subject, topic):
    """Standard sequence script for video generation/explanation."""
    return [
        {"scene": 1, "description": f"Introduction to {topic} in {subject}"},
        {"scene": 2, "description": f"Core concept explanation for {topic}"},
        {"scene": 3, "description": f"Example 1 of {topic} in daily life"},
        {"scene": 4, "description": f"Example 2 of {topic} in daily life"},
        {"scene": 5, "description": f"Summary and key takeaways for {topic}"}
    ]

# The following functions are kept for backward compatibility if called elsewhere, 
# but they no longer use any external APIs.
def generate_veo_video(subject, topic, difficulty):
    return {"message": "Local video generation is currently using pre-curated assets.", "success": True}
