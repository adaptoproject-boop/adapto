# YouTube Recommendation API - Documentation

## Overview
YouTube-based video recommendation system for adaptive e-learning with subject, topic, difficulty, and content type support.

---

## API Endpoints

### 1. Fetch YouTube Videos
**POST** `/api/youtube/videos`

Get YouTube videos based on learning parameters.

**Request Body:**
```json
{
  "subject": "Alphabets",
  "topic": "ABCD learning",
  "difficulty": "Easy",
  "content_type": "Fun",
  "max_results": 3
}
```

**Response:**
```json
{
  "subject": "Alphabets",
  "topic": "ABCD learning",
  "difficulty": "Easy",
  "content_type": "Fun",
  "query": "ABCD learning for kids basic song",
  "videos": [
    {
      "videoId": "ccEpTTZW34g",
      "title": "The Alphabet Song | Learn The ABCs",
      "thumbnail": "https://i.ytimg.com/vi/ccEpTTZW34g/mqdefault.jpg",
      "embedUrl": "https://www.youtube.com/embed/ccEpTTZW34g"
    }
  ]
}
```

---

### 2. List All Subjects
**GET** `/api/youtube/subjects`

Get available subjects.

**Response:**
```json
{
  "subjects": ["Alphabets", "Numbers", "Colors", "Plants", "Flowers"]
}
```

---

### 3. List Topics for Subject
**GET** `/api/youtube/topics/:subject`

Get all topics for a specific subject.

**Example:** `/api/youtube/topics/Alphabets`

**Response:**
```json
{
  "subject": "Alphabets",
  "topics": [
    "ABCD learning",
    "A for Apple B for Ball",
    "Alphabet pronunciation",
    "Alphabet songs for kids"
  ]
}
```

---

## Supported Parameters

### Subjects (5)
- **Alphabets**: ABCD learning, A for Apple B for Ball, Alphabet pronunciation, Alphabet songs
- **Numbers**: Counting 1-10, Counting 1-20, Number recognition, Number songs
- **Colors**: Colors name, Basic colors, Rainbow colors, Color identification
- **Plants**: Plants name, Types of plants, Parts of plants, Plants around us
- **Flowers**: Flowers name, Common flowers, Colorful flowers

### Difficulty Levels
- **Easy**: basic, animated, for beginners
- **Medium**: learning, practice
- **Hard**: advanced, detailed

### Content Types
- **Fun**: song, cartoon, animated
- **Explanation**: explained, simple explanation
- **Standard**: normal learning terms

---

## Implementation Files

| File | Purpose |
|------|---------|
| `backend/models/youtube_model.py` | Core recommendation logic + YouTube API |
| `backend/routes/youtube_routes.py` | Flask API endpoints |
| `backend/.env` | API key configuration |

---

## Testing

Test API locally:
```bash
curl -X POST http://localhost:5612/api/youtube/videos \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Numbers",
    "topic": "Counting 1 to 10",
    "difficulty": "Medium",
    "content_type": "Explanation"
  }'
```

---

## Security Features
✅ `safeSearch=strict` - Child-safe content only  
✅ `videoDuration=short` - Short videos (< 4 min)  
✅ API key in environment variable (not hardcoded)  
✅ Error handling for quota limits
