# Adaptive Decision Model - Documentation

## Overview
The **Central Brain** of the adaptive e-learning system - makes all learning personalization decisions using transparent, rule-based logic.

---

## What is the Adaptive Decision Model?

This model acts as the **ORCHESTRATOR** that:
- ❌ Does NOT call YouTube API
- ❌ Does NOT call Gemini API  
- ✅ ONLY decides what should happen next
- ✅ Tells OTHER models what content to fetch

---

## Architecture

```
Quiz Result + Emotion Detection
            ↓
    ADAPTIVE DECISION MODEL  ← Central Brain (This Model)
            ↓
    ┌───────┴───────┐
    ↓               ↓
YouTube Model   Gemini Model
(Get Videos)    (AI Support)
```

---

## API Endpoints

### 1. Make Adaptive Decision
**POST** `/api/adaptive/decide`

Get personalized learning decision.

**Request:**
```json
{
  "emotion": "confused",
  "quiz_score": 45,
  "current_level": "Medium"
}
```

**Response:**
```json
{
  "next_level": "Easy",
  "content_type": "Explanation",
  "require_gemini_explanation": true,
  "require_gemini_motivation": true,
  "reasoning": {
    "emotion_detected": "confused",
    "quiz_score": 45,
    "current_level": "Medium",
    "next_level": "Easy",
    "decision_explanation": "Score 45% shows struggle → Returning to Easy level | Confusion detected → Explanation content | AI assistance needed"
  }
}
```

---

### 2. View Test Scenarios
**GET** `/api/adaptive/test-scenarios`

See example decisions for different situations.

---

### 3. View Decision Rules
**GET** `/api/adaptive/rules`

Get transparent documentation of all decision rules.

---

## Decision Rules

### Rule 1: Difficulty Level
| Quiz Score | Next Level | Reason |
|------------|------------|--------|
| > 80% | **Hard** | Student mastered content |
| ≥ 50% | **Medium** | Student understood basics |
| < 50% | **Easy** | Student needs review |

### Rule 2: Content Type
| Emotion | Content Type | Reason |
|---------|--------------|--------|
| Bored | **Fun** | Re-engage with entertaining content |
| Confused | **Explanation** | Provide clearer instruction |
| Happy/Neutral | **Standard** | Normal learning pace |

### Rule 3: AI Assistance
| Condition | AI Help | Reason |
|-----------|---------|--------|
| Score < 50% | Explanation + Motivation | Student struggling |
| Confused | Explanation only | Needs clarity |
| Score ≥ 50% | None | Progressing well |

---

## Why Rule-Based?

✅ **Transparent** - Educators can see why decisions were made  
✅ **Explainable** - No "black box" AI  
✅ **Debuggable** - Easy to adjust rules  
✅ **Predictable** - Consistent behavior for kids  
✅ **Compliant** - Meets educational standards

---

## Integration Flow

1. **Quiz Completed** → Quiz score calculated
2. **Emotion Detected** → (Dummy model for now)
3. **Adaptive Model Called** → Makes decision
4. **YouTube Model** → Fetches video based on level + content_type
5. **Gemini Model** → Generates explanation/motivation if needed
6. **Content Delivered** → Personalized learning experience

---

## Implementation Files

| File | Purpose |
|------|---------|
| `backend/models/adaptive_model.py` | Core decision logic |
| `backend/routes/adaptive_routes.py` | REST API endpoints |

---

## Example Usage

**Scenario:** Student confused, scored 45% on Medium level quiz

**Decision:**
- Next Level: **Easy** (needs review)
- Content Type: **Explanation** (confused)
- AI Explanation: **Yes** (struggling + confused)
- AI Motivation: **Yes** (low score)

**Result:** Student gets easy explanation-focused content with AI support! 🎯

---

## Testing

```bash
curl -X POST http://localhost:5612/api/adaptive/decide \
  -H "Content-Type: application/json" \
  -d '{
    "emotion": "bored",
    "quiz_score": 60,
    "current_level": "Easy"
  }'
```
