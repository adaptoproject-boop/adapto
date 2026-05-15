# 🚀 Complete Setup Guide - Adaptive E-Learning System

This guide ensures a **smooth, error-free installation** on any client laptop.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** - [Download](https://nodejs.org/)
- [ ] **Python 3.9+** - [Download](https://www.python.org/downloads/)
- [ ] **MongoDB** - Local installation or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [ ] **Git** - [Download](https://git-scm.com/downloads)
- [ ] **YouTube API Key** - [Get Here](https://console.cloud.google.com/apis/library/youtube.googleapis.com)
- [ ] **Gemini API Key** - [Get Here](https://makersuite.google.com/app/apikey)

### Verify Prerequisites

Run these commands to verify installations:

```bash
# Check Node.js version (should be 18+)
node --version

# Check Python version (should be 3.9+)
python --version

# Check Git
git --version

# Check MongoDB (if local)
mongod --version
```

---

## 📥 Step 1: Clone the Repository

```bash
git clone https://github.com/road2tec/Adaptive-E-Learning-Platform.git
cd "Adaptive E-Learning System for Kids"
```

---

## 🐍 Step 2: Backend Setup

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Create Virtual Environment
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

> [!IMPORTANT]
> You should see `(venv)` in your terminal prompt after activation.

### 2.3 Install Python Dependencies
```bash
pip install -r requirements.txt
```

**Expected Output:**
- Successfully installed Flask, pymongo, gTTS, google-generativeai, and other dependencies
- No error messages

> [!TIP]
> If you encounter SSL errors, try: `pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt`

### 2.4 Configure Environment Variables

**Windows:**
```bash
copy .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

Edit `.env` file with your actual values:

```env
# Server Configuration
PORT=5612
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/adaptive_learning
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/adaptive_learning

# JWT Secret (generate a random string)
JWT_SECRET=your_secret_key_here_change_this

# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key_here

# Google Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here
```

> [!WARNING]
> **Never commit the `.env` file to Git!** It contains sensitive API keys.

### 2.5 Start Backend Server
```bash
python app.py
```

**Expected Output:**
```
MongoDB Connected successfully!
MongoDB Connected successfully!
MongoDB Connected successfully!
MongoDB Connected successfully!
 * Running on http://127.0.0.1:5612
```

> [!NOTE]
> Keep this terminal open. The backend must run continuously.

---

## ⚛️ Step 3: Frontend Setup

### 3.1 Open New Terminal
Open a **new terminal window** (keep backend running in the first one).

### 3.2 Navigate to Frontend Directory
```bash
cd "Adaptive E-Learning System for Kids/frontend"
```

### 3.3 Install Node Dependencies
```bash
npm install
```

**Expected Output:**
- Installing dependencies (this may take 2-5 minutes)
- No error messages
- `added XXX packages` message

> [!TIP]
> If you encounter network errors, try: `npm install --legacy-peer-deps`

### 3.4 Start Frontend Development Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## ✅ Step 4: Verify Installation

### 4.1 Access the Application
Open your browser and navigate to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://127.0.0.1:5612

### 4.2 Test Login
Use demo credentials:

**Student Account:**
```
Email: leo@example.com
Password: password123
```

**Parent Account:**
```
Email: parent@example.com
Password: password123
```

### 4.3 Quick Functionality Test
1. ✅ Login successful
2. ✅ Dashboard loads
3. ✅ Can view lessons
4. ✅ Can watch YouTube videos
5. ✅ Can take quizzes

---

## 🐛 Common Issues & Solutions

### Issue 1: `ModuleNotFoundError` in Python

**Error:**
```
ModuleNotFoundError: No module named 'gtts'
```

**Solution:**
```bash
# Ensure virtual environment is activated
# Then reinstall dependencies
pip install -r requirements.txt
```

---

### Issue 2: MongoDB Connection Failed

**Error:**
```
pymongo.errors.ServerSelectionTimeoutError: localhost:27017
```

**Solution:**
- **Option A (Local MongoDB):** Start MongoDB service
  ```bash
  # Windows
  net start MongoDB
  
  # Mac
  brew services start mongodb-community
  
  # Linux
  sudo systemctl start mongod
  ```

- **Option B (MongoDB Atlas):** Use cloud database
  1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  2. Get connection string
  3. Update `MONGO_URI` in `.env`

---

### Issue 3: Port Already in Use

**Error:**
```
Address already in use: 5612
```

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :5612
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5612 | xargs kill -9
```

---

### Issue 4: npm Install Fails

**Error:**
```
npm ERR! code ERESOLVE
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Install with legacy peer deps
npm install --legacy-peer-deps
```

---

### Issue 5: API Keys Not Working

**Symptoms:**
- YouTube videos not loading
- Gemini AI not responding

**Solution:**
1. Verify API keys are correct in `.env`
2. Check API quotas in Google Cloud Console
3. Ensure APIs are enabled:
   - YouTube Data API v3
   - Generative Language API (Gemini)

---

### Issue 6: CORS Errors

**Error:**
```
Access to fetch blocked by CORS policy
```

**Solution:**
- Ensure backend is running on `http://127.0.0.1:5612`
- Check `Flask-Cors` is installed: `pip show Flask-Cors`
- Restart both frontend and backend

---

## 🔧 Advanced Configuration

### Using Different Ports

**Backend (.env):**
```env
PORT=8000
```

**Frontend (update API calls in code):**
```javascript
// src/config.js or similar
const API_URL = 'http://127.0.0.1:8000';
```

### Production Deployment

For production deployment, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📞 Support

If you encounter issues not covered here:

1. Check existing documentation:
   - [README.md](./README.md)
   - [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

2. Verify all prerequisites are installed correctly

3. Ensure `.env` file has valid API keys

---

## ✨ Installation Complete!

Your Adaptive E-Learning System is now ready to use!

**Next Steps:**
- Explore the student dashboard
- Try different subjects and quizzes
- Check parent/teacher analytics
- Customize content as needed

**Happy Learning! 🎓**
