#!/usr/bin/env python3
"""
Setup Verification Script for Adaptive E-Learning System
This script checks if all prerequisites and dependencies are properly installed.
"""

import sys
import subprocess
import os
from pathlib import Path

def print_header(text):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def print_success(text):
    """Print success message"""
    print(f"✅ {text}")

def print_error(text):
    """Print error message"""
    print(f"❌ {text}")

def print_warning(text):
    """Print warning message"""
    print(f"⚠️  {text}")

def check_python_version():
    """Check Python version"""
    print_header("Checking Python Version")
    version = sys.version_info
    version_str = f"{version.major}.{version.minor}.{version.micro}"
    
    if version.major >= 3 and version.minor >= 9:
        print_success(f"Python {version_str} is installed (Required: 3.9+)")
        return True
    else:
        print_error(f"Python {version_str} is installed (Required: 3.9+)")
        print("   Please upgrade Python: https://www.python.org/downloads/")
        return False

def check_command(command, name, required_version=None):
    """Check if a command exists and optionally verify version"""
    try:
        result = subprocess.run(
            [command, '--version'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            version = result.stdout.strip() or result.stderr.strip()
            print_success(f"{name} is installed: {version.split()[0] if version else 'Unknown version'}")
            return True
        else:
            print_error(f"{name} is not installed")
            return False
    except FileNotFoundError:
        print_error(f"{name} is not installed")
        return False
    except subprocess.TimeoutExpired:
        print_warning(f"{name} check timed out")
        return False
    except Exception as e:
        print_error(f"Error checking {name}: {str(e)}")
        return False

def check_node_version():
    """Check Node.js version"""
    print_header("Checking Node.js Version")
    try:
        result = subprocess.run(
            ['node', '--version'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            version_str = result.stdout.strip()
            version_num = int(version_str.replace('v', '').split('.')[0])
            
            if version_num >= 18:
                print_success(f"Node.js {version_str} is installed (Required: 18+)")
                return True
            else:
                print_error(f"Node.js {version_str} is installed (Required: 18+)")
                print("   Please upgrade Node.js: https://nodejs.org/")
                return False
        else:
            print_error("Node.js is not installed")
            print("   Download from: https://nodejs.org/")
            return False
    except Exception as e:
        print_error(f"Node.js is not installed: {str(e)}")
        return False

def check_virtual_environment():
    """Check if virtual environment exists"""
    print_header("Checking Virtual Environment")
    venv_path = Path("venv")
    
    if venv_path.exists() and venv_path.is_dir():
        print_success("Virtual environment exists")
        
        # Check if activated
        if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
            print_success("Virtual environment is activated")
            return True
        else:
            print_warning("Virtual environment exists but is NOT activated")
            print("   Activate it with:")
            print("   Windows: venv\\Scripts\\activate")
            print("   Mac/Linux: source venv/bin/activate")
            return False
    else:
        print_warning("Virtual environment does not exist")
        print("   Create it with: python -m venv venv")
        return False

def check_python_dependencies():
    """Check if Python dependencies are installed"""
    print_header("Checking Python Dependencies")
    
    required_packages = [
        'flask',
        'flask_cors',
        'pymongo',
        'python-dotenv',
        'PyJWT',
        'flask_bcrypt',
        'google-api-python-client',
        'google-api-core',
        'google-generativeai',
        'gtts',
        'reportlab'
    ]
    
    all_installed = True
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print_success(f"{package} is installed")
        except ImportError:
            print_error(f"{package} is NOT installed")
            all_installed = False
    
    if not all_installed:
        print("\n   Install missing packages with:")
        print("   pip install -r requirements.txt")
    
    return all_installed

def check_env_file():
    """Check if .env file exists and has required variables"""
    print_header("Checking Environment Configuration")
    
    env_path = Path(".env")
    
    if not env_path.exists():
        print_error(".env file does not exist")
        print("   Create it from template:")
        print("   Windows: copy .env.example .env")
        print("   Mac/Linux: cp .env.example .env")
        return False
    
    print_success(".env file exists")
    
    # Check for required variables
    required_vars = [
        'MONGO_URI',
        'YOUTUBE_API_KEY',
        'GEMINI_API_KEY',
        'JWT_SECRET',
        'PORT'
    ]
    
    with open(env_path, 'r') as f:
        content = f.read()
    
    all_configured = True
    for var in required_vars:
        if var in content:
            # Check if it has a value (not just the template placeholder)
            if f"{var}=your_" in content or f"{var}=" not in content:
                print_warning(f"{var} exists but may not be configured")
                all_configured = False
            else:
                print_success(f"{var} is configured")
        else:
            print_error(f"{var} is missing")
            all_configured = False
    
    if not all_configured:
        print("\n   Edit .env file and add your actual API keys")
    
    return all_configured

def check_mongodb_connection():
    """Check MongoDB connection"""
    print_header("Checking MongoDB Connection")
    
    try:
        from pymongo import MongoClient
        from dotenv import load_dotenv
        
        load_dotenv()
        mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/adaptive_learning')
        
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.server_info()
        print_success("MongoDB connection successful")
        return True
    except ImportError:
        print_error("pymongo not installed")
        return False
    except Exception as e:
        print_error(f"MongoDB connection failed: {str(e)}")
        print("   Make sure MongoDB is running or use MongoDB Atlas")
        return False

def check_frontend_dependencies():
    """Check if frontend dependencies are installed"""
    print_header("Checking Frontend Dependencies")
    
    frontend_path = Path("../frontend")
    node_modules = frontend_path / "node_modules"
    
    if node_modules.exists() and node_modules.is_dir():
        print_success("Frontend dependencies are installed")
        return True
    else:
        print_error("Frontend dependencies are NOT installed")
        print("   Navigate to frontend folder and run:")
        print("   npm install")
        return False

def main():
    """Main verification function"""
    print("\n" + "="*60)
    print("  🚀 Adaptive E-Learning System - Setup Verification")
    print("="*60)
    
    # Change to backend directory if not already there
    if Path("app.py").exists():
        print("\n📍 Running from backend directory")
    else:
        print_error("Please run this script from the backend directory")
        sys.exit(1)
    
    results = []
    
    # Run all checks
    results.append(("Python Version", check_python_version()))
    results.append(("Node.js Version", check_node_version()))
    results.append(("Git", check_command('git', 'Git')))
    results.append(("Virtual Environment", check_virtual_environment()))
    results.append(("Python Dependencies", check_python_dependencies()))
    results.append(("Environment Configuration", check_env_file()))
    results.append(("MongoDB Connection", check_mongodb_connection()))
    results.append(("Frontend Dependencies", check_frontend_dependencies()))
    
    # Summary
    print_header("Verification Summary")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print(f"\n{'='*60}")
    print(f"  Results: {passed}/{total} checks passed")
    print(f"{'='*60}\n")
    
    if passed == total:
        print("🎉 All checks passed! Your setup is ready.")
        print("\nNext steps:")
        print("1. Start backend: python app.py")
        print("2. Start frontend: cd ../frontend && npm run dev")
        print("3. Open browser: http://localhost:5173")
    else:
        print("⚠️  Some checks failed. Please fix the issues above.")
        print("\nRefer to SETUP_GUIDE.md for detailed instructions.")
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
