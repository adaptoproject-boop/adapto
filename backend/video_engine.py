import os
import json
import hashlib
from gtts import gTTS
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, TextClip, CompositeVideoClip
from PIL import Image, ImageDraw, ImageFont
import textwrap
import requests

# Configuration
VIDEO_STORAGE_DIR = "static/videos"
VIDEO_LIBRARY_DIR = "static/videos/library"
TEMP_ASSETS_DIR = "temp_assets"

# Ensure directories exist
os.makedirs(VIDEO_STORAGE_DIR, exist_ok=True)
os.makedirs(VIDEO_LIBRARY_DIR, exist_ok=True)
os.makedirs(TEMP_ASSETS_DIR, exist_ok=True)

def generate_video_filename(subject, topic, suffix=""):
    """Generate a unique filename based on subject and topic."""
    # Use a short hash to ensure uniqueness across special chars
    raw = f"{subject}_{topic}".lower()
    clean = raw.replace(" ", "_").replace("/", "_").replace("-", "_")
    # Limit length and append hash for guaranteed uniqueness
    short_hash = hashlib.md5(raw.encode()).hexdigest()[:6]
    base = f"{clean[:40]}_{short_hash}"
    if suffix:
        base = f"{base}_{suffix}"
    return f"{base}.mp4"

def get_fallback_video(subject, topic=None):
    """
    Search for any existing video related to the subject to use as a fallback.
    Very flexible: Checks library/ and static/videos/ for matches.
    """
    try:
        subject_lower = subject.lower()
        search_dirs = [VIDEO_LIBRARY_DIR, VIDEO_STORAGE_DIR]
        
        # Typos mapping for user convenience (e.g. Albhabets -> Alphabets)
        typo_map = {
            "alphabets": "albhabets",
            "albhabets": "alphabets"
        }
        alt_subject = typo_map.get(subject_lower, subject_lower)

        # 1. Look for a strong match (Subject + Topic)
        if topic:
            topic_clean = topic.lower().replace(" ", "_").replace("-", "_")
            for directory in search_dirs:
                if not os.path.exists(directory): continue
                
                for file in os.listdir(directory):
                    f_lower = file.lower()
                    if (subject_lower in f_lower or alt_subject in f_lower) and \
                       (topic_clean in f_lower or topic.lower() in f_lower) and \
                       f_lower.endswith(".mp4"):
                        return os.path.join(directory, file)

        # 2. Look for any subject match (especially A to Z or Full Sequence)
        for directory in search_dirs:
            if not os.path.exists(directory): continue
            
            for file in os.listdir(directory):
                f_lower = file.lower()
                # Check for "subject names" or common patterns like "a to z"
                if (subject_lower in f_lower or alt_subject in f_lower) and f_lower.endswith(".mp4"):
                    # Prioritize "A to Z" or "Full Sequence" if available
                    if "a to z" in f_lower or "full" in f_lower or "sequence" in f_lower:
                        return os.path.join(directory, file)
                    # Return first match otherwise
                    return os.path.join(directory, file)

        return None
    except Exception as e:
        print(f"Error finding fallback video: {e}")
        return None


def download_veo_video(subject, topic, video_uri):
    """
    Download a video from a URI (returned by Veo) and save it locally.
    Returns the relative path to the saved file.
    """
    filename = generate_video_filename(subject, topic, suffix="veo")
    output_path = os.path.join(VIDEO_STORAGE_DIR, filename)

    try:
        print(f"Downloading Veo video from: {video_uri}")
        # Veo URIs might require specialized headers or just standard GET
        # For GenAI SDK, it's often a direct downloadable link or requires the SDK to fetch
        # If it's a standard HTTPS URL:
        response = requests.get(video_uri, stream=True)
        response.raise_for_status()

        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"Successfully downloaded Veo video to: {output_path}")
        return output_path
    except Exception as e:
        print(f"Error downloading Veo video: {e}")
        return None


def generate_video(subject, topic, script_data):
    """
    Orchestrate the video generation process.
    
    Args:
        subject (str): Subject name
        topic (str): Topic name
        script_data (dict): The JSON script from Gemini
        
    Returns:
        str: Relative path to the generated video file
    """
    import json
    import hashlib
    
    # Create a hash of the actual script content to prevent browser caching from showing old videos
    # when the script changes (e.g., from old error fallback to new sequence fallback)
    try:
        script_str = json.dumps(script_data, sort_keys=True)
        content_hash = hashlib.md5(script_str.encode()).hexdigest()[:6]
    except:
        content_hash = "v1"
        
    filename = generate_video_filename(subject, topic, suffix=content_hash)
    output_path = os.path.join(VIDEO_STORAGE_DIR, filename)
    
    # 0. Check Library First (High Priority)
    lib_filename = f"{subject.lower()}_{topic.lower()}.mp4"
    lib_path = os.path.join(VIDEO_LIBRARY_DIR, lib_filename)
    if os.path.exists(lib_path):
        print(f"Found curated video in library: {lib_path}")
        return lib_path

    # 1. Check Technical Cache
    if os.path.exists(output_path):
        print(f"Video already exists in cache: {output_path}")
        return output_path

    print(f"Generating new CARTOON video for: {subject} - {topic}")
    
    clips = []
    
    if not isinstance(script_data, dict):
        print(f"Error: script_data is not a dict, it is {type(script_data)}")
        return None
        
    scenes = script_data.get("scenes", [])
    
    if not isinstance(scenes, list):
        print(f"Error: scenes is not a list, it is {type(scenes)}")
        # Try to recover: maybe the LLM sent a single scene dict or wrapped it weirdly
        if isinstance(scenes, dict):
            scenes = [scenes]
        else:
            return None
            
    try:
        for index, scene in enumerate(scenes):
            if not isinstance(scene, dict):
                print(f"Error: scene is not a dict: type {type(scene)}, value {scene}")
                continue
                
            print(f"Processing Scene {index + 1}/{len(scenes)}: {scene.get('label', 'Scene')}")
            
            # 2. Generate Audio
            audio_path = _generate_audio(scene['narration'], index)
            audio_clip = AudioFileClip(audio_path)
            duration = audio_clip.duration + 0.4 # Slightly smaller buffer
            
            # 3. Generate Visual
            image_path = _create_text_slide(
                text=scene['narration'], 
                subject=subject, 
                index=index,
                duration=duration
            )
            
            # 4. Create Video Clip
            image_clip = ImageClip(image_path).set_duration(duration)
            
            # Combine Image + Audio
            video_clip = image_clip.set_audio(audio_clip)
            video_clip.fps = 24
            clips.append(video_clip)
            
        if not clips:
            print("No clips generated. Check script format.")
            return None

        # 5. Assemble Final Video
        print(f"Concatenating {len(clips)} clips... (This may take a moment)")
        final_video = concatenate_videoclips(clips, method="compose")
        final_video.write_videofile(output_path, fps=24, codec='libx264', audio_codec='aac', threads=4)
        
        # 6. Cleanup Memory
        final_video.close()
        for clip in clips:
            clip.close()
            if clip.audio:
                clip.audio.close()
        
        _cleanup_temp_files()
        print(f"Successfully generated sequence video: {output_path}")
        
        # 7. Also save to Library for permanent access (Auto-curation)
        try:
            import shutil
            shutil.copy2(output_path, lib_path)
            print(f"Saved to permanent library: {lib_path}")
        except Exception as copy_err:
            print(f"Could not save to library: {copy_err}")

        return output_path
        
    except Exception as e:
        print(f"CRITICAL ERROR in generate_video: {str(e)}")
        import traceback
        traceback.print_exc()
        _cleanup_temp_files()
        return None

def _generate_audio(text, index):
    """Generate MP3 from text using gTTS."""
    tts = gTTS(text=text, lang='en', slow=False)
    filename = os.path.join(TEMP_ASSETS_DIR, f"audio_{index}.mp3")
    tts.save(filename)
    return filename

def _create_text_slide(text, subject, index, duration):
    """
    Create a fun, cartoonish text slide using Pillow (PIL).
    """
    width, height = 1280, 720
    
    # 🎨 Cartoonish Color Palettes (Vibrant & Kids Friendly)
    palettes = [
        {"bg": (255, 223, 186), "accent": (255, 127, 80)}, # Peach & Coral
        {"bg": (186, 225, 255), "accent": (30, 144, 255)}, # Sky Blue & Dodger
        {"bg": (186, 255, 201), "accent": (60, 179, 113)}, # Mint & SeaGreen
        {"bg": (255, 179, 186), "accent": (220, 20, 60)},  # Soft Pink & Crimson
        {"bg": (255, 255, 186), "accent": (255, 215, 0)},  # Canary & Gold
        {"bg": (224, 187, 228), "accent": (147, 112, 219)} # Lavender & Purple
    ]
    palette = palettes[index % len(palettes)]
    bg_color = palette["bg"]
    accent_color = palette["accent"]
    
    # Create Image
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Draw Background Decoration (Circles/Bubbles)
    for i in range(5):
        r = 100 + (index * 20) % 150
        x = (index * 250 + i * 300) % width
        y = (i * 200) % height
        draw.ellipse([x-r, y-r, x+r, y+r], fill=(255, 255, 255, 50), outline=None)

    # Draw a Rounded Rectangle for the text "Stage"
    stage_margin = 80
    draw.rounded_rectangle(
        [stage_margin, stage_margin, width-stage_margin, height-stage_margin],
        radius=40,
        fill=(255, 255, 255, 200),
        outline=accent_color,
        width=8
    )
    
    # Fonts
    try:
        # Load a playful font if possible, else default
        header_font = ImageFont.truetype("arialbd.ttf", 60) # Bold
        text_font = ImageFont.truetype("arial.ttf", 45)
    except:
        header_font = ImageFont.load_default()
        text_font = ImageFont.load_default()

    # Draw Header (Subject) - Cartoon style
    header_y = stage_margin + 50
    draw.text((width/2, header_y), subject.upper(), font=header_font, fill=accent_color, anchor="mm")
    
    # Draw a small divider line
    line_y = header_y + 50
    draw.line([width/2 - 100, line_y, width/2 + 100, line_y], fill=accent_color, width=5)

    # Wrap and Draw Narration Text
    wrapper = textwrap.TextWrapper(width=35) 
    word_list = wrapper.wrap(text=text) 
    caption_new = "\n".join(word_list)
    
    draw.text((width/2, height/2 + 20), caption_new, font=text_font, fill=(60, 60, 60), anchor="mm", align="center")
    
    # Draw "Kids Mascot" placeholder / Fun icon
    fun_icons = ["⭐", "🎈", "🎨", "🚀", "🌈", "🧩", "🐯", "🐶"]
    draw.text((width - stage_margin - 60, height - stage_margin - 60), fun_icons[index % len(fun_icons)], font=header_font, fill=accent_color, anchor="mm")

    # Save Image
    filename = os.path.join(TEMP_ASSETS_DIR, f"slide_{index}.png")
    img.save(filename)
    return filename

def _cleanup_temp_files():
    """Remove temporary audio and image files."""
    try:
        for file in os.listdir(TEMP_ASSETS_DIR):
            file_path = os.path.join(TEMP_ASSETS_DIR, file)
            if os.path.isfile(file_path):
                os.unlink(file_path)
    except Exception as e:
        print(f"Error cleaning up: {e}")

if __name__ == "__main__":
    # Test Run
    test_script = {
        "scenes": [
            {
                "narration": "Welcome to our lesson about colours.",
                "visual_prompt": "Title card",
                "duration": 3
            },
            {
                "narration": "Red is the colour of apples and fire trucks.",
                "visual_prompt": "Red apple",
                "duration": 4
            }
        ]
    }
    generate_video("Colors", "Red", test_script)
