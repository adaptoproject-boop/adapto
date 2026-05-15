import json
import os

class VideoBank:
    def __init__(self, content_bank_path=None):
        if content_bank_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            content_bank_path = os.path.join(base_dir, 'data', 'content_bank.json')
        
        self.content_bank_path = content_bank_path
        self.content_bank = self._load_content_bank()

    def _load_content_bank(self):
        try:
            if os.path.exists(self.content_bank_path):
                with open(self.content_bank_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return {"video_bank": {}}
        except Exception as e:
            print(f"Error loading content bank: {e}")
            return {"video_bank": {}}

    def get_videos(self, subject, topic, difficulty="Easy", content_type="Standard", max_results=3):
        difficulty = difficulty.capitalize()
        subject_data = self.content_bank.get("video_bank", {}).get(subject, {})
        topic_videos = subject_data.get(topic, {})
        
        videos = topic_videos.get(difficulty, [])
        if not videos:
            # Fallback to any difficulty
            for d in ["Easy", "Medium", "Hard"]:
                if topic_videos.get(d):
                    videos = topic_videos[d]
                    break
        
        if not videos:
            # Absolute fallback if no videos found for topic
            return {
                "success": False,
                "message": "No videos found in local bank",
                "videos": []
            }
        
        # Return in the same format as youtube_model.py
        return {
            "success": True,
            "subject": subject,
            "topic": topic,
            "difficulty": difficulty,
            "videos": videos[:max_results]
        }

# Global instance
bank = VideoBank()

def get_videos(subject, topic, difficulty="Easy", content_type="Standard", max_results=3):
    return bank.get_videos(subject, topic, difficulty, content_type, max_results)
