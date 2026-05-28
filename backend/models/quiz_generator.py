import json
import random
import os
import re

class QuizGenerator:
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
            else:
                print(f"Warning: Content bank not found at {self.content_bank_path}")
                return {"quizzes": {}}
        except Exception as e:
            print(f"Error loading content bank: {e}")
            return {"quizzes": {}}

    def _load_curriculum(self):
        try:
            if os.path.exists(self.curriculum_path):
                with open(self.curriculum_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                print(f"Warning: Curriculum not found at {self.curriculum_path}")
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

    def generate_quiz(self, subject, topic, difficulty="Easy"):
        """
        Generates a quiz for a given subject and topic at a specific difficulty.
        """
        difficulty = difficulty.capitalize()
        questions = []
        
        # 1. Try to get from content bank
        subject_quizzes = self.content_bank.get("quizzes", {}).get(subject, {})
        topic_quizzes = subject_quizzes.get(topic, {})
        questions = topic_quizzes.get(difficulty, [])

        # 2. If not found, try to find any difficulty for the topic in content bank
        if not questions:
            for d in ["Easy", "Medium", "Hard"]:
                if topic_quizzes.get(d):
                    questions = topic_quizzes[d]
                    break
        
        # 3. If still not found, search curriculum.json
        if not questions:
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
            
            # If matching lessons found, format their quiz_data
            if matched_lessons:
                raw_questions = []
                for lesson in matched_lessons:
                    raw_questions.extend(lesson.get('quiz_data', []))
                
                # Format raw questions to match content bank style
                for idx, q in enumerate(raw_questions):
                    question_text = q.get('question') or q.get('text') or q.get('question_text') or (q.get('image_emoji') and "What is this?") or "Choose the correct answer"
                    options = q.get('options', [])
                    
                    correct_answer = q.get('correctAnswer') or q.get('answer')
                    if isinstance(correct_answer, str) and correct_answer in options:
                        correct_answer_idx = options.index(correct_answer)
                    else:
                        try:
                            correct_answer_idx = int(correct_answer)
                        except:
                            correct_answer_idx = 0
                    
                    explanation = q.get('explanation', '')
                    emoji = q.get('image_emoji') or q.get('emoji', '💡')
                    
                    questions.append({
                        "id": idx + 1,
                        "question": question_text,
                        "options": options,
                        "correctAnswer": correct_answer_idx,
                        "explanation": explanation,
                        "emoji": emoji
                    })
        
        # 4. If still not found, check for default quiz
        if not questions:
            return self._get_default_quiz(subject, topic)

        # Shuffle questions and options for variety
        sampled_questions = random.sample(questions, min(len(questions), 5))
        
        # For each question, shuffle options and update correctAnswer index
        final_questions = []
        for q in sampled_questions:
            q_copy = q.copy()
            options = q_copy["options"]
            correct_ans_text = options[q_copy["correctAnswer"]]
            
            # Create a list of (option_text, is_correct)
            option_pairs = [(text, text == correct_ans_text) for text in options]
            random.shuffle(option_pairs)
            
            # Reconstruct options and find new correct index
            q_copy["options"] = [pair[0] for pair in option_pairs]
            q_copy["correctAnswer"] = [pair[1] for pair in option_pairs].index(True)
            final_questions.append(q_copy)

        return final_questions

    def _get_default_quiz(self, subject, topic):
        """Fallback for when content bank doesn't have the specific topic yet."""
        return [
            {
                "id": 1,
                "question": f"What is a key part of {topic}?",
                "options": ["Part A", "Part B", "Part C", "Part D"],
                "correctAnswer": 0,
                "explanation": f"Part A is very important for {topic}!",
                "emoji": "💡"
            }
        ]

# Global instance
generator = QuizGenerator()

def generate_quiz(subject, topic, difficulty="Easy"):
    return generator.generate_quiz(subject, topic, difficulty)
