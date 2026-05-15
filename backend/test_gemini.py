import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
print("Key starts with:", api_key[:4] if api_key else "None")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model='gemini-1.5-flash',
        contents='Tell me a joke.'
    )
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
