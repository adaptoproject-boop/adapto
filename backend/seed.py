import os
from pymongo import MongoClient
import bcrypt
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.get_database()

def seed_lessons():
    # Clear existing lessons for fresh start in this demo context
    db.lessons.delete_many({})
    
    lessons = [
        # 1) LANGUAGE BASICS
        {"title": "Phonics (Letter Sounds)", "description": "Learn letter sounds!", "subject": "Language Basics", "level": "easy", "order": 1},
        {"title": "Simple Words (cat, bat, ball)", "description": "Easy words to read.", "subject": "Language Basics", "level": "easy", "order": 2},
        {"title": "Rhymes & Storytelling", "description": "Fun stories and songs.", "subject": "Language Basics", "level": "easy", "order": 3},

        # 2) NUMBERS & MATH
        {"title": "Number Recognition", "description": "Identify numbers 1-20.", "subject": "Numbers & Math", "level": "easy", "order": 1},
        {"title": "Basic Addition & Subtraction", "description": "Simple math fun.", "subject": "Numbers & Math", "level": "easy", "order": 2},
        {"title": "Bigger vs Smaller", "description": "Compare sizes.", "subject": "Numbers & Math", "level": "easy", "order": 3},

        # 3) LOGICAL THINKING
        {"title": "Patterns", "description": "Solve cool patterns.", "subject": "Logical Thinking", "level": "easy", "order": 1},
        {"title": "Match the Following", "description": "Link objects together.", "subject": "Logical Thinking", "level": "easy", "order": 2},
        {"title": "Find the Odd One Out", "description": "Spot the difference.", "subject": "Logical Thinking", "level": "easy", "order": 3},

        # 4) ENVIRONMENT & NATURE
        {"title": "Animals & Their Sounds", "description": "Meet animal friends.", "subject": "Environment & Nature", "level": "easy", "order": 1},
        {"title": "Fruits & Vegetables", "description": "Healthy food facts.", "subject": "Environment & Nature", "level": "easy", "order": 2},
        {"title": "Seasons & Weather", "description": "Explore sunny to snowy.", "subject": "Environment & Nature", "level": "easy", "order": 3},

        # 5) SHAPES & COLORS
        {"title": "Basic Shapes", "description": "Circle, Square, Triangle.", "subject": "Shapes & Colors", "level": "easy", "order": 1},
        {"title": "Advanced Shapes", "description": "Star, Oval, Rectangle.", "subject": "Shapes & Colors", "level": "easy", "order": 2},
        {"title": "Colors Recognition", "description": "Enjoy the rainbow.", "subject": "Shapes & Colors", "level": "easy", "order": 3},

        # 6) GENERAL AWARENESS
        {"title": "Body Parts", "description": "Learn about yourself.", "subject": "General Awareness", "level": "easy", "order": 1},
        {"title": "Family Members", "description": "Daddy, Mommy, Sister.", "subject": "General Awareness", "level": "easy", "order": 2},
        {"title": "Good Habits", "description": "Hygiene and sharing.", "subject": "General Awareness", "level": "easy", "order": 3}
    ]
    
    db.lessons.insert_many(lessons)
    print("Lessons seeded!")

if __name__ == '__main__':
    seed_lessons()
