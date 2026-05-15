import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit()

client = genai.Client(api_key=api_key)

models = [m.name for m in client.models.list()]
veo_models = [m for m in models if 'veo' in m.lower()]

if veo_models:
    print(f"YES! You have access to Veo: {veo_models}")
else:
    print("NO, Veo model not found for this API key.")
    print(f"Total models available: {len(models)}")
    # Print the first few just for reference
    for m in models[:10]:
        print(f" - {m}")
