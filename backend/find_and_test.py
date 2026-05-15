import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

print("Listing and testing models...")
try:
    for m in client.models.list():
        print(f"\nModel: {m.name}")
        # Only try if it supports generateContent (just a guess on the attribute name based on common patterns)
        try:
            response = client.models.generate_content(
                model=m.name,
                contents="Hello"
            )
            print(f"SUCCESS with {m.name}: {response.text.strip()}")
            print(f"*** USE THIS: {m.name} ***")
            # exit(0) # Stop at first success
        except Exception as e:
            print(f"FAILED with {m.name}: {e}")
except Exception as e:
    print(f"Error: {e}")
