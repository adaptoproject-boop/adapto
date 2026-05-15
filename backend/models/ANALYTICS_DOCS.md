# Analytics Model - Documentation

## Overview
Read-only data analysis system providing transparent insights for Parents and Teachers using statistical aggregation (no machine learning).

---

## Purpose

The Analytics Model:
- ✅ **Analyzes** stored learning data from MongoDB
- ✅ **Generates** insights for Parents and Teachers
- ✅ **Uses** statistical aggregation only
- ❌ **Does NOT** modify learning flow
- ❌ **Does NOT** call YouTube/Gemini APIs
- ❌ **Does NOT** use machine learning

---

## API Endpoints

### 1. Parent Analytics
**GET** `/api/analytics/parent/:childId`

Get comprehensive child progress analytics.

**Response:**
```json
{
  "childName": "Leo",
  "quiz_scores": [
    {"lesson": "A for Apple", "score": 85, "date": "2025-12-30", "passed": true, "starsEarned": 4}
  ],
  "level_progression": {
    "Alphabets": [
      {"date": "2025-12-30", "level": "medium", "score": 85}
    ]
  },
  "pass_retry_stats": {
    "total_quizzes": 10,
    "passed": 8,
    "retries": 2,
    "pass_rate": 80.0
  },
  "emotion_usage": {
    "happy": 5,
    "bored": 2,
    "confused": 3
  },
  "content_style_usage": {
    "normal": 6,
    "fun": 2,
    "easy_explanation": 2
  },
  "overall_summary": {
    "total_lessons_completed": 8,
    "average_score": 78.5,
    "total_stars_earned": 32,
    "current_levels": {
      "Alphabets": "medium",
      "Numbers": "easy"
    }
  }
}
```

---

### 2. Teacher Analytics
**GET** `/api/analytics/teacher?class_id=X&subject=Y`

Get class-wide performance analytics.

**Query Parameters:**
- `class_id` (optional) - Filter by class
- `subject` (optional) - Filter by subject

**Response:**
```json
{
  "student_performance": {
    "student123": {"average_score": 85.5, "total_quizzes": 10},
    "student456": {"average_score": 72.3, "total_quizzes": 8}
  },
  "topic_analysis": [
    {"topic": "A for Apple", "average_score": 82.5, "attempts": 15},
    {"topic": "Counting 1-10", "average_score": 68.2, "attempts": 12}
  ],
  "weak_topics": [
    {"topic": "Parts of Plants", "average_score": 55.0, "attempts": 8}
  ],
  "difficulty_distribution": {
    "easy": 45,
    "medium": 32,
    "hard": 23
  },
  "class_summary": {
    "total_students": 25,
    "total_quizzes_taken": 100,
    "average_class_score": 75.8,
    "pass_rate": 82.0,
    "students_above_70": 18,
    "students_below_50": 3
  }
}
```

---

### 3. Analytics Summary
**GET** `/api/analytics/summary`

Get list of available endpoints and metrics.

---

## Metrics Explained

### Parent Metrics

| Metric | Definition | Purpose |
|--------|------------|---------|
| **Quiz Scores** | Last 10 quiz results | Track recent performance |
| **Level Progression** | Difficulty evolution per subject | Monitor learning growth |
| **Pass/Retry Stats** | Success rate percentage | Gauge overall comprehension |
| **Emotion Usage** | Content style distribution | Understand engagement patterns |
| **Overall Summary** | Aggregate stats | Quick progress overview |

### Teacher Metrics

| Metric | Definition | Purpose |
|--------|------------|---------|
| **Student Performance** | Per-student averages | Identify struggling students |
| **Topic Analysis** | Average scores per lesson | Find challenging topics |
| **Weak Topics** | Topics with <60% avg | Prioritize teaching focus |
| **Difficulty Distribution** | Easy/Medium/Hard usage | Balance curriculum |
| **Class Summary** | Overall class stats | Holistic class view |

---

## Data Flow

```
MongoDB Collections
       ↓
┌──────────────┐
│  users       │ → Current levels, total stars
│  quiz_results│ → Scores, emotions, levels
│  lessons     │ → Lesson metadata
└──────────────┘
       ↓
Analytics Model
(Statistical Aggregation)
       ↓
┌──────────────────────┐
│ Parent Analytics     │
│ Teacher Analytics    │
└──────────────────────┘
       ↓
Chart-Ready JSON
```

---

## Statistical Techniques Used

1. **Aggregation** - Sum, count, average
2. **Grouping** - Group by student, subject, topic
3. **Filtering** - Date ranges, score thresholds
4. **Sorting** - Identify weak topics, top performers
5. **Percentage Calculation** - Pass rates, distribution

**NO Machine Learning** - All metrics are transparent and explainable!

---

## Error Handling

**Empty Data:**
```json
{
  "message": "No learning data available yet. Start learning to see analytics!",
  "quiz_scores": [],
  ...
}
```

**Invalid User:**
```json
{
  "error": "Child not found"
}
```

**Database Error:**
```json
{
  "error": "Database connection failed"
}
```

---

## Implementation Files

| File | Purpose |
|------|---------|
| `backend/models/analytics_model.py` | Core analytics logic |
| `backend/routes/analytics_routes.py` | REST API endpoints |

---

## Access Control

**Parent Access:**
- ✅ Can view own child's analytics
- ❌ Cannot view other children

**Teacher Access:**
- ✅ Can view own class analytics
- ❌ Cannot view other classes

**Admin Access:**
- ✅ Full access to all analytics

---

## Testing

```bash
# Parent analytics
curl http://localhost:5612/api/analytics/parent/child_id_here

# Teacher analytics (all students)
curl http://localhost:5612/api/analytics/teacher

# Teacher analytics (filtered)
curl "http://localhost:5612/api/analytics/teacher?subject=Alphabets"

# Available endpoints
curl http://localhost:5612/api/analytics/summary
```

---

## Why No Machine Learning?

✅ **Transparent** - Parents/teachers understand calculations  
✅ **Explainable** - No "black box" predictions  
✅ **Simple** - Easy to debug and maintain  
✅ **Fast** - No model training required  
✅ **Reliable** - Deterministic results

This analytics model provides **trustworthy insights** that educators can rely on.
