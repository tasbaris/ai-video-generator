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