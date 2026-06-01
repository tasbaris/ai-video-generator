import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Mevcut API anahtarın
API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)

def generate_story_and_prompts(topic: str, story_type: str = "Genel", image_count: int = 5) -> dict:
    model = genai.GenerativeModel('gemini-3.1-flash-lite')
    
    prompt = f"""
    Sen profesyonel bir senaristisin. 
    Ana Konu ve Unsurlar: {topic}
    Tür: {story_type}
    
    Görevlerin:
    1. Belirtilen 'Ana Konu ve Unsurlar'ı kusursuzca harmanlayarak yaklaşık 120-150 kelimelik, sürükleyici, Türkçe bir hikaye yaz. Hikaye {story_type} tonunda olmalıdır. Sadece kelimeleri geçirme, onları hikayenin merkezine oturt.
    2. Bu hikaye için tam {image_count} adet görsel promptu oluştur. 
    
    GÖRSEL TALİMATI: Promptlar İNGİLİZCE olmalı ve çok detaylı yazılmalıdır. Türüne göre şu stilleri KESİNLİKLE kullan:
    - Tür "Korku" ise: "Highly detailed photorealistic, dark, eerie, scary, cinematic lighting, horror movie scene..."
    - Tür "Çocuk" ise: "A high-quality 3D Disney/Pixar animation style scene, vibrant colors, cute, magical..."
    - Tür "Belgesel" ise: "National Geographic photography style, extremely realistic, 8k resolution, documentary footage..."
    - Diğerleri için: Hikayenin moduna en uygun sinematik stili seç.
    
    Çıktın SADECE şu JSON formatında olmalı:
    {{
        "story": "Hikaye metni...",
        "prompts": [
            "Scene 1 detailed English prompt...", 
            ... (tam {image_count} adet olacak)
        ]
    }}
    """
    
    response = model.generate_content(prompt)
    print("LLM'den gelen ham yanıt:", response.text)
    
    text = response.text.strip()
    if text.startswith('```json'): 
        text = text[7:-3]
    elif text.startswith('```'): 
        text = text[3:-3]
        
    return json.loads(text)


from moviepy.editor import AudioFileClip, CompositeAudioClip
import moviepy.audio.fx.all as afx
import os

# ... video.py içindeki diğer kodların ...

def create_video_with_effects(image_paths, audio_path, srt_path, output_mp4):
    # Ana sesi (TTS - Konuşma) yükle
    tts_audio = AudioFileClip(audio_path)
    
    # ---------------- FON MÜZİĞİ KISMI ----------------
    bg_music_path = "bg_music.mp3" # Ana dizine koyacağın müzik dosyası
    
    if os.path.exists(bg_music_path):
        # Müziği yükle ve sesini %10'a kıs ki konuşmayı bastırmasın
        bg_music = AudioFileClip(bg_music_path).fx(afx.volumex, 0.1)
        
        # Müzik videodan kısaysa döngüye al (loop), uzunsa videonun süresine göre kes
        bg_music = afx.audio_loop(bg_music, duration=tts_audio.duration)
        
        # Konuşma sesi ile fon müziğini birleştir
        final_audio = CompositeAudioClip([tts_audio, bg_music])
    else:
        # Müzik dosyası yoksa sadece konuşmayı kullan
        final_audio = tts_audio
        