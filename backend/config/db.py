import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def connect_db():
    """
    Initialize and return Supabase client.
    """
    try:
        url: str = os.getenv("SUPABASE_URL")
        key: str = os.getenv("SUPABASE_KEY")
        
        if not url or not key or url == "your_supabase_project_url":
            print("Warning: Supabase credentials not fully configured in .env")
            return None
            
        supabase: Client = create_client(url, key)
        print("Supabase Connected successfully!")
        return supabase
    except Exception as e:
        print(f"Supabase connection error: {e}")
        return None
