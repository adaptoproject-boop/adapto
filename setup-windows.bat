@echo off
REM Quick Setup Script for Windows - Adaptive E-Learning System
REM This script automates the installation process

echo ============================================================
echo   Adaptive E-Learning System - Quick Setup (Windows)
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed!
    echo Please download and install Python 3.9+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Python and Node.js are installed
echo.

REM Navigate to backend
echo ============================================================
echo   Step 1: Setting up Backend
echo ============================================================
echo.

cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo.

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)
echo [OK] Python dependencies installed
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo [IMPORTANT] Please edit backend\.env and add your API keys:
    echo   - MONGO_URI
    echo   - YOUTUBE_API_KEY
    echo   - GEMINI_API_KEY
    echo   - JWT_SECRET
    echo.
    pause
) else (
    echo [OK] .env file already exists
)
echo.

REM Go back to root
cd ..

REM Setup frontend
echo ============================================================
echo   Step 2: Setting up Frontend
echo ============================================================
echo.

cd frontend

REM Install Node dependencies
echo Installing Node.js dependencies (this may take a few minutes)...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo [OK] Node.js dependencies installed
echo.

REM Go back to root
cd ..

echo ============================================================
echo   Setup Complete!
echo ============================================================
echo.
echo Next steps:
echo.
echo 1. Edit backend\.env with your API keys (if not done already)
echo.
echo 2. Start the backend (in one terminal):
echo    cd backend
echo    venv\Scripts\activate
echo    python app.py
echo.
echo 3. Start the frontend (in another terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open your browser:
echo    http://localhost:5173
echo.
echo For detailed instructions, see SETUP_GUIDE.md
echo.
pause
