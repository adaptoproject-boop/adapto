import json
import random
import os

class QuizGenerator:
    def __init__(self, content_bank_path=None):
        if content_bank_path is None:
            # Default path relative to this file
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            content_bank_path = os.path.join(base_dir, 'data', 'content_bank.json')
        
        self.content_bank_path = content_bank_path
        self.content_bank = self._load_content_bank()

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

    def generate_quiz(self, subject, topic, difficulty="Easy"):
        """
        Generates a quiz for a given subject and topic at a specific difficulty.
        """
        difficulty = difficulty.capitalize()
        
        # 1. Try to get from content bank
        subject_quizzes = self.content_bank.get("quizzes", {}).get(subject, {})
        topic_quizzes = subject_quizzes.get(topic, {})
        questions = topic_quizzes.get(difficulty, [])

        # 2. If not found, try to fallback to a similar topic or general subject
        if not questions:
            # Try to find any difficulty for the topic
            for d in ["Easy", "Medium", "Hard"]:
                if topic_quizzes.get(d):
                    questions = topic_quizzes[d]
                    break
        
        # 3. If still not found, check for hardcoded fallbacks in original gemini_model logic
        if not questions:
            # We return an empty list or a default set
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
