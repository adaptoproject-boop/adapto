from flask import Blueprint, request, jsonify, send_file
from gtts import gTTS
import os
import io

voice_routes = Blueprint('voice_routes', __name__)

@voice_routes.route('/speak', methods=['POST'])
def speak():
    """
    Generate speech from text.
    Request Body:
    {
        "text": "Hello World",
        "language": "en" | "hi" | "mr",
        "emotion": "happy" | "bored" | "confused" (optional)
    }
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        lang = data.get('language', 'en')
        emotion = data.get('emotion', 'happy')

        if not text:
            return jsonify({'error': 'Text is required'}), 400

        # Adjust speed based on emotion (Dummy Emotion Logic)
        slow = False
        if emotion == 'confused':
            slow = True # Speak slower if confused
        
        # Mapping frontend language codes to gTTS codes if needed
        # gTTS supports 'en', 'hi', 'mr' directly
        
        tts = gTTS(text=text, lang=lang, slow=slow)
        
        # Save to memory buffer
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        return send_file(
            mp3_fp,
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name="speech.mp3"
        )

    except Exception as e:
        print(f"TTS Error: {e}")
        return jsonify({'error': str(e)}), 500
