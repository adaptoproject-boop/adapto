class EmotionModel:
    def __init__(self):
        # Expression map from face-api.js to platform states
        self.EXPRESSION_MAP = {
            "happy": "happy",
            "sad": "sad",
            "angry": "frustrated",
            "disgusted": "frustrated",
            "surprised": "happy",
            "fearful": "confused",
            "neutral": "focused"
        }

    def detect_emotion(self, face_expression=None, quiz_score=None, response_times=None):
        """
        Composite emotion detection.
        1. If face_expression is provided, use it primarily.
        2. If not, use performance heuristics.
        """
        
        # Priority 1: Direct face expression mapping
        if face_expression and face_expression.lower() in self.EXPRESSION_MAP:
            return self.EXPRESSION_MAP[face_expression.lower()]

        # Priority 2: Performance Heuristics
        if quiz_score is not None:
            if quiz_score >= 80:
                # High score + fast response = focused/happy
                if response_times and sum(response_times)/len(response_times) < 5:
                    return "focused"
                return "happy"
            elif quiz_score < 40:
                # Low score = confused/frustrated
                if response_times and sum(response_times)/len(response_times) > 15:
                    return "confused"
                return "frustrated"
            elif 40 <= quiz_score < 60:
                return "confused"

        # Default fallback
        return "happy"

# Global instance
model = EmotionModel()

def detect_emotion(face_expression=None, quiz_score=None, response_times=None):
    return model.detect_emotion(face_expression, quiz_score, response_times)
