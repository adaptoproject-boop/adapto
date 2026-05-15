"""
Custom Video Bank Model
Replaces YouTube Search API with a local curated database.
"""

from models.video_bank import get_videos as get_local_videos

SUBJECTS_TOPICS = {
    "Language Basics": ["Phonics (Letter Sounds)", "Simple Words (cat, bat, ball)", "Rhymes & Storytelling"],
    "Numbers & Math": ["Number Recognition", "Basic Addition & Subtraction", "Bigger vs Smaller"],
    "Logical Thinking": ["Patterns", "Match the Following", "Find the Odd One Out"],
    "Environment & Nature": ["Animals & Their Sounds", "Fruits & Vegetables", "Seasons & Weather"],
    "Shapes & Colors": ["Basic Shapes", "Advanced Shapes", "Colors Recognition"],
    "General Awareness": ["Body Parts", "Family Members", "Good Habits"]
}

def get_youtube_videos(subject, topic, difficulty="Medium", content_type="Standard", max_results=3):
    """
    Interface compatible with the original youtube_model.py,
    but pulls from the local video bank.
    """
    try:
        # Normalize inputs
        difficulty = difficulty or "Medium"
        
        # Use local video bank model
        result = get_local_videos(subject, topic, difficulty, content_type, max_results)
        
        # If success is false (no videos found), we can provide a default message
        if not result.get("success"):
            return {
                "success": False,
                "message": f"No local videos available for {topic}. Please check back later!",
                "videos": []
            }
            
        return result

    except Exception as e:
        print(f"Error in video bank router: {e}")
        return {
            "success": False,
            "error": str(e),
            "videos": []
        }

def generate_search_query(subject, topic, difficulty, content_type):
    """Kept for compatibility, but no longer used for API calls."""
    return f"{subject} {topic} educational video for kids {difficulty}"

def get_available_subjects():
    """Returns list of available subjects in the content bank."""
    return list(SUBJECTS_TOPICS.keys())

def get_topics_for_subject(subject):
    """Returns list of topics for a specific subject."""
    return SUBJECTS_TOPICS.get(subject, [])
