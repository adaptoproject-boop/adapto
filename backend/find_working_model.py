import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

print(f"Testing with API Key: {api_key[:10]}...")

# Models we saw in the list
models_to_try = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro'
]

for model_id in models_to_try:
    print(f"\n--- Testing model: {model_id} ---")
    try:
        response = client.models.generate_content(
            model=model_id,
            contents="Respond with only the word 'OK' if you can hear me."
        )
        print(f"RESULT: SUCCESS! Response: {response.text.strip()}")
        print(f"SUGGESTION: Use '{model_id}' in gemini_model.py")
        break
    except Exception as e:
        print(f"RESULT: FAILED. Error: {e}")

print("\nTests complete.")
