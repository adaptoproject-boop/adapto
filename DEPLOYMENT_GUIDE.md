# 🚀 Deployment & Run Guide - Adaptive E-Learning System for Kids

## Overview
Complete step-by-step guide to run the Adaptive E-Learning Platform locally or deploy to cloud.

**Architecture:** React Frontend + Flask Backend + MongoDB + AI APIs (YouTube + Gemini)

---

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://www.python.org/downloads/))
- **MongoDB** (Local or Atlas) ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))

### API Keys Required
- **YouTube Data API v3 Key** ([Get Here](https://console.cloud.google.com/apis/library/youtube.googleapis.com))
- **Google Gemini API Key** ([Get Here](https://makersuite.google.com/app/apikey))

---

## 🏠 Local Deployment

### Step 1: Clone Repository
```bash
git clone https://github.com/road2tec/Adaptive-E-Learning-Platform.git
cd "Adaptive E-Learning System for Kids"
```

---

### Step 2: Backend Setup

#### 2.1 Create Virtual Environment
```bash
cd backend
python -m venv venv
```

#### 2.2 Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

#### 2.3 Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2.4 Configure Environment Variables
Create a `.env` file in `backend/` directory:

```bash
# Copy example file
copy .env.example .env     # Windows
cp .env.example .env       # Mac/Linux
```

Edit `.env` file with your API keys:
```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/adaptive_learning
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/adaptive_learning

# API Keys
YOUTUBE_API_KEY=your_youtube_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=5612
FLASK_ENV=development
```

#### 2.5 Start Backend Server
```bash
python app.py
```

✅ **Backend running at:** `http://localhost:5612`

---

### Step 3: Frontend Setup

#### 3.1 Install Dependencies
```bash
# Open new terminal
cd frontend
npm install
```

#### 3.2 Start Development Server
```bash
npm run dev
```

✅ **Frontend running at:** `http://localhost:5173`

---

### Step 4: MongoDB Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
# Windows: MongoDB Compass or mongod.exe
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Add to `.env` as `MONGO_URI`

---

## ✅ Verification Steps

### Backend Health Check
```bash
curl http://localhost:5612
# Response: "Adaptive E-Learning Flask API is running..."
```

### Frontend Access
Open browser: `http://localhost:5173`

---

## 👤 Demo User Accounts

### Kid Login
```
Email: leo@example.com
Password: password123
Role: Student
```

### Parent Login
```
Email: parent@example.com
Password: password123
Role: Parent
```

---

## 🎯 Complete Learning Flow Demo

### 1. Login as Kid (Leo)
- Navigate to `http://localhost:5173`
- Login with kid credentials

### 2. Select Lesson
- Choose a subject (Alphabets, Numbers, Colors, Shapes, Plants, Flowers)
- Click on a lesson (e.g., "A for Apple")

### 3. Watch YouTube Video
- Video loads automatically
- **Auto-unlock:** Quiz unlocks when video ends (no button needed!)

### 4. Select Emotion
- Choose how you feel (Happy, Bored, Confused, Focused)

### 5. Take Quiz
- Answer 5 multiple-choice questions
- Visual feedback for correct/wrong answers

### 6. View Results
- See score percentage
- Star rating (1-5 stars)
- Level progression indicator (⬆️ Level Up! or ⬇️ Level Down)

### 7. Adaptive Next Step
- System recommends next difficulty level
- Fetches new YouTube videos based on performance
- Shows AI explanation/motivation if needed

### 8. Parent Dashboard
- Logout and login as Parent
- View child's learning analytics
- See quiz scores, level progression, emotion usage

---

## 🔧 Environment Variables Explained

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/adaptive_learning` | Yes |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | `AIzaSy...` | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` | Yes |
| `PORT` | Backend server port | `5612` | No (default: 5612) |
| `FLASK_ENV` | Flask environment | `development` | No |

---

## ☁️ Cloud Deployment (Optional)

### Backend Deployment

#### Option 1: Render
1. Create account at [Render](https://render.com/)
2. Create new Web Service
3. Connect GitHub repository
4. Set environment variables in Render dashboard
5. Deploy

#### Option 2: Railway
1. Create account at [Railway](https://railway.app/)
2. Create new project
3. Connect GitHub repository
4. Add environment variables
5. Deploy

#### Option 3: AWS EC2
1. Launch EC2 instance (Ubuntu)
2. Install Python, dependencies
3. Setup nginx reverse proxy
4. Use PM2 or supervisor for process management

### Frontend Deployment

#### Option 1: Vercel (Recommended)
```bash
cd frontend
npm install -g vercel
vercel
```

#### Option 2: Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`

### Database - MongoDB Atlas
1. Already cloud-based
2. Update `MONGO_URI` in backend environment variables
3. Whitelist deployment server IP

---

## ❌ Common Errors & Fixes

### Error 1: API Key Not Found
```
Error: Gemini API key not configured
```
**Fix:** 
- Check `.env` file exists in `backend/` directory
- Verify `GEMINI_API_KEY=your_actual_key` (no quotes)
- Restart backend server

### Error 2: MongoDB Connection Failed
```
Error: Database connection failed
```
**Fix:**
- Ensure MongoDB is running: `mongod --version`
- Check `MONGO_URI` in `.env`
- For Atlas: Whitelist your IP address

### Error 3: YouTube Quota Exceeded
```
Error: YouTube API quota exceeded
```
**Fix:**
- YouTube API has daily quota limits
- System will use **fallback videos** from mockData
- Wait 24 hours for quota reset
- OR upgrade YouTube API quota

### Error 4: CORS Error
```
Access to fetch blocked by CORS policy
```
**Fix:**
- Verify backend is running on port 5612
- Check `CORS(app)` is enabled in `backend/app.py`
- Frontend should proxy to `http://localhost:5612`

### Error 5: Port Already in Use
```
Error: Address already in use
```
**Fix:**
```bash
# Windows
netstat -ano | findstr :5612
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5612 | xargs kill -9
```

---

## 🧪 Testing Adaptive Learning Flow

### Test Case 1: High Score → Level Up
1. Login as student
2. Take quiz and score 85%+
3. **Expected:** Next level = HARD, Standard content

### Test Case 2: Low Score → Need Help
1. Login as student
2. Take quiz and score 30%
3. **Expected:** Next level = EASY, Gemini explanation + motivation

### Test Case 3: Confused → Easy Explanation
1. Select emotion: "Confused"
2. Take quiz
3. **Expected:** Explanation-style videos recommended

---

## 📦 Project Structure
```
Adaptive E-Learning System for Kids/
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Context (Auth, Learning)
│   │   ├── pages/             # Page components
│   │   └── mockData.js        # Lesson data (6 subjects)
│   └── package.json
│
├── backend/                    # Flask API
│   ├── models/                # AI Models
│   │   ├── youtube_model.py   # YouTube recommendations
│   │   ├── gemini_model.py    # Gemini AI
│   │   ├── adaptive_model.py  # Decision engine
│   │   └── analytics_model.py # Analytics
│   ├── controllers/
│   │   └── orchestrator.py    # System coordinator
│   ├── routes/                # API endpoints
│   ├── .env                   # Environment variables (create this)
│   ├── .env.example           # Template
│   └── requirements.txt
│
└── README.md
```

---

## 📚 API Endpoints Reference

### Orchestrator (Main)
```
POST /api/learning/next-step      - Complete adaptive flow
GET  /api/learning/progress/:id   - Student analytics
```

### Individual Modules (Optional)
```
POST /api/youtube/videos          - Get videos
POST /api/gemini/explain          - Get explanation
POST /api/adaptive/decide         - Get adaptive decision
GET  /api/analytics/parent/:id    - Parent analytics
```

---

## 🔒 Security Best Practices

✅ **Never commit `.env` file** (added to `.gitignore`)  
✅ **Use environment variables** for all API keys  
✅ **Rotate API keys** periodically  
✅ **Setup MongoDB authentication** for production  
✅ **Use HTTPS** in production deployment

---

## 🎓 Educational Notes

### Dummy Emotion Model
Current emotion detection is **rule-based** (dummy):
- High score → Happy
- Low score → Confused

**Future Enhancement:** Replace with real ML emotion detection using computer vision.

### Modular Architecture
All AI modules are **independent**:
- YouTube Model (video recommendations)
- Gemini Model (AI assistance)
- Adaptive Model (decision engine)
- Analytics Model (insights)
- **Orchestrator** (coordinates all)

This design allows easy swapping/updating of individual components.

---

## 🚀 Quick Start Commands

### Full System Launch
```bash
# Terminal 1: Backend
cd backend
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux
python app.py

# Terminal 2: Frontend
cd frontend
npm run dev

# Open browser: http://localhost:5173
```

---

## 📞 Support & Troubleshooting

**Common Issues:** See [Common Errors](#common-errors--fixes) section above

**Documentation:**
- `backend/models/YOUTUBE_API_DOCS.md`
- `backend/models/GEMINI_API_DOCS.md`
- `backend/controllers/ORCHESTRATOR_DOCS.md`

---

## ✨ This system is deployment-ready and scalable.

**Features:**
- ✅ 6 subjects with 54 child-safe YouTube videos
- ✅ 5 independent AI modules coordinated by orchestrator
- ✅ Adaptive difficulty based on quiz scores
- ✅ Emotion-aware content recommendations
- ✅ Parent/teacher analytics dashboards
- ✅ Complete error handling with fallbacks
- ✅ Production-ready architecture

**Made with ❤️ for kids' learning**
