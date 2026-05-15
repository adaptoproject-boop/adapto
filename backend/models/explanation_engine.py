import json
import random
import os

class ExplanationEngine:
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
            return {"explanations": {}, "motivations": {}, "teacher_help": {}}
        except Exception as e:
            print(f"Error loading content bank: {e}")
            return {"explanations": {}, "motivations": {}, "teacher_help": {}}

    def get_explanation(self, subject, topic, difficulty="Easy"):
        difficulty = difficulty.capitalize()
        subject_data = self.content_bank.get("explanations", {}).get(subject, {})
        topic_data = subject_data.get(topic, {})
        
        explanation = topic_data.get(difficulty)
        if not explanation:
            # Fallback to any difficulty
            for d in ["Easy", "Medium", "Hard"]:
                if topic_data.get(d):
                    explanation = topic_data[d]
                    break
        
        return explanation or f"Let's learn more about {topic} in {subject}! It's a very interesting topic that helps us understand the world better."

    def get_motivation(self, score, name="Student", topic="the lesson"):
        # Determine score category
        if score >= 80:
            category = "excellent"
        elif score >= 50:
            category = "good"
        elif score >= 30:
            category = "needs_practice"
        else:
            category = "try_again"
        
        templates = self.content_bank.get("motivations", {}).get(category, ["Keep going!"])
        template = random.choice(templates)
        
        return template.format(score=score, name=name, topic=topic)

    def get_teacher_help(self, subject, topic, difficulty="Easy"):
        suggestions = self.content_bank.get("teacher_help", {}).get(subject, [])
        if not suggestions:
            return "Encourage the student to explore the topic through play and everyday activities."
        
        # Return a bulleted list of 2-3 random suggestions
        selected = random.sample(suggestions, min(len(suggestions), 3))
        return "\n".join([f"• {s}" for s in selected])

# Global instance
engine = ExplanationEngine()

def get_explanation(subject, topic, difficulty="Easy"):
    return engine.get_explanation(subject, topic, difficulty)

def get_motivation(score, name="Student", topic="the lesson"):
    return engine.get_motivation(score, name, topic)

def get_teacher_help(subject, topic, difficulty="Easy"):
    return engine.get_teacher_help(subject, topic, difficulty)
