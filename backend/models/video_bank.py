import json
import os
import re

def extract_youtube_id(url):
    if not url:
        return None
    # Matches: youtube.com/watch?v=ID, youtube.com/embed/ID, youtu.be/ID, etc.
    pattern = r'(?:https?://)?(?:www\.)?(?:youtube\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)|watch\?.*v=)|youtu\.be/)([^"&?/\s]{11})'
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    return None

class VideoBank:
    def __init__(self, content_bank_path=None, curriculum_path=None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if content_bank_path is None:
            content_bank_path = os.path.join(base_dir, 'data', 'content_bank.json')
        if curriculum_path is None:
            curriculum_path = os.path.join(base_dir, 'data', 'curriculum.json')
        
        self.content_bank_path = content_bank_path
        self.curriculum_path = curriculum_path
        self.content_bank = self._load_content_bank()
        self.curriculum = self._load_curriculum()

    def _load_content_bank(self):
        try:
            if os.path.exists(self.content_bank_path):
                with open(self.content_bank_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return {"video_bank": {}}
        except Exception as e:
            print(f"Error loading content bank: {e}")
            return {"video_bank": {}}

    def _load_curriculum(self):
        try:
            if os.path.exists(self.curriculum_path):
                with open(self.curriculum_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return []
        except Exception as e:
            print(f"Error loading curriculum: {e}")
            return []

    def _normalize(self, text):
        if not text:
            return ""
        text = text.lower()
        # strip non-ascii (like emojis)
        text = re.sub(r'[^\x00-\x7F]+', '', text)
        # strip punctuation except space and alphanumeric
        text = re.sub(r'[^a-z0-9\s]', '', text)
        return " ".join(text.split())

    def get_videos(self, subject, topic, difficulty="Easy", content_type="Standard", max_results=3):
        difficulty = difficulty.capitalize()
        videos = []
        
        # 1. Try content bank first
        subject_data = self.content_bank.get("video_bank", {}).get(subject, {})
        topic_videos = subject_data.get(topic, {})
        videos = topic_videos.get(difficulty, [])
        if not videos:
            # Fallback to any difficulty in content bank
            for d in ["Easy", "Medium", "Hard"]:
                if topic_videos.get(d):
                    videos = topic_videos[d]
                    break
        
        # 2. If not found in content bank, search curriculum.json
        if not videos:
            norm_subject = self._normalize(subject)
            norm_topic = self._normalize(topic)
            
            matched_lessons = []
            
            # Step A: Exact normalized topic match
            for lesson in self.curriculum:
                l_topic = self._normalize(lesson.get('topic', ''))
                if l_topic == norm_topic:
                    matched_lessons.append(lesson)
            
            # Step B: Substring topic match
            if not matched_lessons:
                for lesson in self.curriculum:
                    l_topic = self._normalize(lesson.get('topic', ''))
                    if norm_topic in l_topic or l_topic in norm_topic:
                        matched_lessons.append(lesson)
            
            # Step C: Subject match fallback
            if not matched_lessons:
                for lesson in self.curriculum:
                    l_subject = self._normalize(lesson.get('subject', ''))
                    if norm_subject in l_subject or l_subject in norm_subject:
                        matched_lessons.append(lesson)
            
            # Convert matched lessons into video objects
            for lesson in matched_lessons:
                video_url = lesson.get('video_url')
                vid_id = extract_youtube_id(video_url)
                if vid_id:
                    # Avoid duplicates
                    if not any(v['videoId'] == vid_id for v in videos):
                        videos.append({
                            "videoId": vid_id,
                            "title": lesson.get('topic', topic),
                            "thumbnail": f"https://i.ytimg.com/vi/{vid_id}/mqdefault.jpg",
                            "embedUrl": f"https://www.youtube.com/embed/{vid_id}"
                        })
        
        if not videos:
            # Absolute fallback if no videos found for topic
            return {
                "success": False,
                "message": "No videos found in local bank or curriculum",
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
