from flask import Blueprint, request, jsonify, send_from_directory
from models.gemini_model import generate_gemini_response
from video_engine import generate_video, get_fallback_video, download_veo_video
import os

video_bp = Blueprint('video_routes', __name__)

@video_bp.route('/generate', methods=['POST'])
def generate_educational_video():
    """
    Endpoint to generate a subject educational video.
    
    Expected JSON body:
    {
        "subject": "Alphabets",
        "topic": "Letter A",
        "style": "normal" | "fun" | "easy_explanation",
        "age_group": "6-12" (optional)
    }
    """
    try:
        data = request.json
        subject = data.get('subject')
        topic = data.get('topic')
        style = data.get('style', 'normal')
        age_group = data.get('age_group', '6-12')
        
        if not subject or not topic:
            return jsonify({"error": "Subject and topic are required"}), 400

        print(f"Received video generation request: {subject} - {topic} ({style})")

        # 1. OPTIONAL: Veo High Quality Animation
        if data.get('use_veo'):
            veo_prompt = data.get('veo_prompt', f"A child-friendly educational cartoon about {topic} in {subject}, colorful and engaging style")
            veo_res = generate_gemini_response(
                subject=subject,
                topic=topic,
                request_type="veo_video",
                context={"prompt": veo_prompt}
            )
            
            if "error" in veo_res:
                print(f"Veo failed: {veo_res['error']}. Falling back to standard engine.")
            elif veo_res.get("content"):
                video_url = download_veo_video(subject, topic, veo_res["content"])
                if video_url:
                    web_path = "/" + video_url.replace("\\", "/")
                    return jsonify({
                        "success": True,
                        "message": "Veo animation generated successfully!",
                        "video_url": web_path,
                        "model": "veo-3.1-fast"
                    })

        # 0. Check for Curated Video in Library/Videos first
        from video_engine import get_fallback_video
        library_match = get_fallback_video(subject, topic)
        if library_match:
            print(f"LUCKY FIND! Serving stored video: {library_match}")
            return jsonify({
                "success": True,
                "video_url": "/" + library_match.replace("\\", "/"),
                "message": "Enjoy this special adventure!"
            })

        # 1. Get Script from Gemini (if not in library)
        script_response = generate_gemini_response(
            subject=subject, 
            topic=topic, 
            difficulty="Medium", 
            request_type="video_script",
            context={"style": style}
        )
        
        if "error" in script_response and not script_response.get("content"):
            fallback = get_fallback_video(subject)
            if fallback:
                return jsonify({
                    "success": True, 
                    "is_fallback": True,
                    "message": "AI is recharging, showing a classic adventure!",
                    "video_url": "/" + fallback.replace("\\", "/")
                })
            return jsonify({"error": "Failed to generate script", "details": script_response["error"]}), 500
            
        script_data = script_response["content"]
        
        # Ensure it's a dict
        if isinstance(script_data, str):
            print("--- RAW GEMINI OUTPUT ---")
            print(script_data)
            print("-------------------------")
            try:
                import json
                import re
                
                # Strip markdown blocks first
                clean_json = script_data.replace('```json', '').replace('```', '').strip()
                
                # Find the first { or [ and the last } or ]
                match = re.search(r'(\{.*\}|\[.*\])', clean_json, re.DOTALL)
                if match:
                    clean_json = match.group(1)
                    
                script_data = json.loads(clean_json)
            except Exception as e:
                print(f"Failed to parse script. Raw response was: {script_data[:100]}...")
                return jsonify({"error": f"Failed to parse script JSON: {str(e)}"}), 500

        if not isinstance(script_data, dict):
            # If the LLM just returned a list of scenes, wrap it
            if isinstance(script_data, list):
                script_data = {"title": f"{subject} Video", "scenes": script_data}
            else:
                print(f"Type error: script is {type(script_data)}. Content: {str(script_data)[:100]}...")
                return jsonify({"error": f"Invalid script format generated. Expected dictionary, got {type(script_data).__name__}."}), 500

        # Create unique filename including style
        filename_prefix = f"{style}_" if style != "normal" else ""
        filename = f"{filename_prefix}{subject}_{topic}".lower().replace(" ", "_") + ".mp4"
        
        # 2. Generate Video
        video_path = generate_video(subject, topic, script_data)
        
        if not video_path:
            fallback = get_fallback_video(subject)
            if fallback:
                return jsonify({
                    "success": True, 
                    "is_fallback": True,
                    "message": "AI is recharging, showing a classic adventure!",
                    "video_url": "/" + fallback.replace("\\", "/")
                })
            return jsonify({"error": "Failed to generate video file"}), 500
            
        web_path = "/" + video_path.replace("\\", "/")
        
        return jsonify({
            "success": True,
            "message": f"Video ({style}) generated successfully",
            "video_url": web_path,
            "script": script_data
        })

    except Exception as e:
        print(f"Error in video endpoint: {e}")
        fallback = get_fallback_video(subject) if 'subject' in locals() else None
        if fallback:
            return jsonify({
                "success": True, 
                "is_fallback": True,
                "message": "AI is recharging, showing a classic adventure!",
                "video_url": "/" + fallback.replace("\\", "/")
            })
        return jsonify({"error": str(e)}), 500


@video_bp.route('/sequence', methods=['POST'])
def generate_sequence_video():
    """
    Endpoint to generate a full subject sequence (e.g., A-Z).
    """
    try:
        data = request.json
        subject = data.get('subject')
        
        if not subject:
            return jsonify({"error": "Subject is required"}), 400

        print(f"Received sequence video request: {subject}")

        topics = data.get('topics', [])
        
        # 0. Check for Curated full subject video in Library/Videos first
        from video_engine import get_fallback_video
        library_match = get_fallback_video(subject, "Full_Sequence")
        if library_match:
            print(f"LUCKY FIND! Serving stored sequence video: {library_match}")
            return jsonify({
                "success": True,
                "video_url": "/" + library_match.replace("\\", "/"),
                "message": "Let's start our big adventure!"
            })

        # 1. Get Long Script from Gemini (if not in library)
        script_response = generate_gemini_response(
            subject=subject, 
            topic="Full Sequence", 
            request_type="sequence_script",
            extra_data={"topics": topics}
        )
        
        if "error" in script_response and not script_response.get("content"):
            fallback = get_fallback_video(subject)
            if fallback:
                return jsonify({
                    "success": True, 
                    "is_fallback": True,
                    "message": "AI is recharging, showing a classic adventure!",
                    "video_url": "/" + fallback.replace("\\", "/")
                })
            return jsonify({"error": "Failed to generate sequence script"}), 500
            
        script_data = script_response["content"]
        
        # Ensure it's a dict (reuse same logic as /generate)
        if isinstance(script_data, str):
            print("--- RAW GEMINI OUTPUT ---")
            print(script_data)
            print("-------------------------")
            try:
                import json
                import re
                
                # Strip markdown blocks first
                clean_json = script_data.replace('```json', '').replace('```', '').strip()
                
                # Find the first { or [ and the last } or ]
                match = re.search(r'(\{.*\}|\[.*\])', clean_json, re.DOTALL)
                if match:
                    clean_json = match.group(1)
                    
                script_data = json.loads(clean_json)
            except Exception as e:
                print(f"Failed to parse sequence script. Raw response was: {script_data[:100]}...")
                return jsonify({"error": f"Failed to parse script JSON: {str(e)}"}), 500

        if not isinstance(script_data, dict):
            # If the LLM just returned a list of scenes, wrap it
            if isinstance(script_data, list):
                script_data = {"title": f"{subject} Sequence Video", "scenes": script_data}
            else:
                print(f"Type error: sequence script is {type(script_data)}. Content: {str(script_data)[:100]}...")
                return jsonify({"error": f"Invalid script format generated. Expected dictionary, got {type(script_data).__name__}."}), 500
        
        # 2. Generate Video (Reuse the same engine, it handles list of scenes)
        video_path = generate_video(subject, "Full_Sequence", script_data)
        
        if not video_path:
            fallback = get_fallback_video(subject)
            if fallback:
                return jsonify({
                    "success": True, 
                    "is_fallback": True,
                    "message": "AI is recharging, showing a classic adventure!",
                    "video_url": "/" + fallback.replace("\\", "/")
                })
            return jsonify({"error": "Failed to generate sequence video"}), 500
            
        web_path = "/" + video_path.replace("\\", "/")
        
        return jsonify({
            "success": True,
            "message": "Sequence video generated successfully",
            "video_url": web_path,
            "script": script_data
        })

    except Exception as e:
        print(f"Error in sequence endpoint: {e}")
        fallback = get_fallback_video(subject) if 'subject' in locals() else None
        if fallback:
            return jsonify({
                "success": True, 
                "is_fallback": True,
                "message": "AI is recharging, showing a classic adventure!",
                "video_url": "/" + fallback.replace("\\", "/")
            })
        return jsonify({"error": str(e)}), 500
