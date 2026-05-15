#!/bin/bash
# Quick Setup Script for Mac/Linux - Adaptive E-Learning System
# This script automates the installation process

echo "============================================================"
echo "  Adaptive E-Learning System - Quick Setup (Mac/Linux)"
echo "============================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python is not installed!"
    echo "Please install Python 3.9+ from https://www.python.org/downloads/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "[OK] Python and Node.js are installed"
echo ""

# Navigate to backend
echo "============================================================"
echo "  Step 1: Setting up Backend"
echo "============================================================"
echo ""

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "[OK] Virtual environment created"
else
    echo "[OK] Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo ""

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install Python dependencies"
    exit 1
fi
echo "[OK] Python dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "[IMPORTANT] Please edit backend/.env and add your API keys:"
    echo "  - MONGO_URI"
    echo "  - YOUTUBE_API_KEY"
    echo "  - GEMINI_API_KEY"
    echo "  - JWT_SECRET"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
else
    echo "[OK] .env file already exists"
fi
echo ""

# Go back to root
cd ..

# Setup frontend
echo "============================================================"
echo "  Step 2: Setting up Frontend"
echo "============================================================"
echo ""

cd frontend

# Install Node dependencies
echo "Installing Node.js dependencies (this may take a few minutes)..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install Node.js dependencies"
    exit 1
fi
echo "[OK] Node.js dependencies installed"
echo ""

# Go back to root
cd ..

echo "============================================================"
echo "  Setup Complete!"
echo "============================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit backend/.env with your API keys (if not done already)"
echo ""
echo "2. Start the backend (in one terminal):"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python app.py"
echo ""
echo "3. Start the frontend (in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open your browser:"
echo "   http://localhost:5173"
echo ""
echo "For detailed instructions, see SETUP_GUIDE.md"
echo ""
