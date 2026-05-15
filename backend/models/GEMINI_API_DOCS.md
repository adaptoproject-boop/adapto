# Gemini AI API - Documentation

## Overview
AI-powered learning assistance using Google Gemini for intelligent educational content generation.

---

## API Endpoints

### 1. Generate AI Content (Main Endpoint)
**POST** `/api/gemini/generate`

Generate any type of AI content with full control.

**Request Body:**
```json
{
  "subject": "Alphabets",
  "topic": "A for Apple",
  "difficulty": "Easy",
  "request_type": "explanation",
  "context": {
    "score": 85
  }
}
```

---

### 2. Topic Explanation
**POST** `/api/gemini/explain`

Get simple, child-friendly topic explanations.

**Request:**
```json
{
  "subject": "Numbers",
  "topic": "Counting 1 to 10",
  "difficulty": "Easy"
}
```

**Response:**
```json
{
  "request_type": "explanation",
  "subject": "Numbers",
  "topic": "Counting 1 to 10",
  "difficulty": "Easy",
  "content": "Counting is when we say numbers in order! Let's start with 1, 2, 3... and count all the way to 10. You can count your fingers, your toys, or anything you see around you! It's like a fun number game."
}
```

---

### 3. Quiz Generation
**POST** `/api/gemini/quiz`

Auto-generate quiz questions for any topic.

**Request:**
```json
{
  "subject": "Colors",
  "topic": "Rainbow colors",
  "difficulty": "Medium"
}
```

**Response:**
```json
{
  "request_type": "quiz",
  "subject": "Colors",
  "topic": "Rainbow colors",
  "difficulty": "Medium",
  "content": [
    {
      "question": "What are the colors of the rainbow?",
      "options": ["Red, Blue, Green", "Red, Orange, Yellow, Green, Blue, Indigo, Violet", "Black, White", "Pink, Purple"],
      "correctAnswer": 1,
      "explanation": "Rainbow has 7 colors: ROYGBIV!"
    }
  ]
}
```

---

### 4. Student Motivation
**POST** `/api/gemini/motivate`

Generate encouraging messages for kids.

**Request:**
```json
{
  "subject": "Alphabets",
  "topic": "ABCD learning",
  "score": 45
}
```

**Response:**
```json
{
  "request_type": "motivation",
  "content": "Great job trying your best! 🌟 Learning the alphabet takes practice, and you're doing wonderfully. Keep going - you'll get even better with each try! I believe in you! ⭐"
}
```

---

### 5. Teacher Content Suggestions
**POST** `/api/gemini/teacher-help`

Get creative teaching ideas.

**Request:**
```json
{
  "subject": "Plants",
  "topic": "Parts of plants",
  "difficulty": "Medium"
}
```

**Response:**
```json
{
  "request_type": "teacher_help",
  "content": "1. Plant Dissection Activity - Have kids explore real plant parts\n2. Create a Plant Diagram - Draw and label roots, stem, leaves\n3. Garden Visit - Observe plants growing in nature\n4. Plant Growth Video - Show time-lapse of plant development\n5. Parts of Plants Song - Make learning fun with music"
}
```

---

## Request Types

| Type | Purpose | Output |
|------|---------|--------|
| `explanation` | Simple topic explanation | 3-4 sentences, child-friendly |
| `quiz` | Auto-generate questions | 5 MCQs with 4 options each |
| `motivation` | Encourage students | Short motivational message |
| `teacher_help` | Teaching suggestions | 4-5 creative teaching ideas |

---

## Difficulty Levels
- **Easy**: Basic, simple language
- **Medium**: Moderate complexity
- **Hard**: Advanced but age-appropriate

---

## Implementation Files

| File | Purpose |
|------|---------|
| `backend/models/gemini_model.py` | Core AI intelligence logic |
| `backend/routes/gemini_routes.py` | Flask API endpoints |

---

## Child-Safety Features
✅ Prompts designed for ages 6-12  
✅ Simple, non-technical language  
✅ Positive, encouraging tone  
✅ Educational content only  
✅ Fallback responses for API failures

---

## Testing

Test locally:
```bash
curl -X POST http://localhost:5612/api/gemini/explain \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Colors",
    "topic": "Rainbow colors",
    "difficulty": "Easy"
  }'
```
