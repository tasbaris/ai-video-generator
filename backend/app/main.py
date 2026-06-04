from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import uuid
import asyncio
import concurrent.futures
from datetime import datetime, timezone
import PIL.Image
import yt_dlp
import imageio_ffmpeg

# moviepy ve Pillow 10+ uyumluluğu için yama (monkey patch)
if not hasattr(PIL.Image, 'ANTIALIAS'):
    PIL.Image.ANTIALIAS = PIL.Image.Resampling.LANCZOS

from .database import engine, Base, get_db, SessionLocal
from .models import Story
from .services.llm import generate_story_and_prompts
from .services.image import download_image
from .services.tts import generate_audio_and_subs
from .services.video import create_video_with_effects
from .services.trends import get_trending_topics

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Video Generator API")

# Frontend için CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Üretilen videoları sunmak için
os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")

from typing import List

class VideoRequest(BaseModel):
    topic: str
    story_type: str = "Genel"
    image_count: int = 5
    include_bg_music: bool = True

def download_bg_music(story_type: str, output_path: str):
    """
    Konuşmasız (instrumental) ve süresi 3.5 dakikayı (210 saniye) geçmeyen 
    telifsiz bir fon müziği indirir.
    """
    print(f"[{story_type}] için sözsüz fon müziği aranıyor...")
    
    # "instrumental" ekleyerek konuşma videolarından kurtuluyoruz
    search_query = f"ytsearch10:royalty free instrumental background music {story_type} no copyright"
    
    base_path = output_path.rsplit('.mp3', 1)[0]
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': base_path,
        # yt-dlp'nin kendi katı süre filtresi (210 saniyeden uzunları es geçer)
        'match_filter': yt_dlp.utils.match_filter_func("duration < 210"),
        'max_downloads': 1,
        'ffmpeg_location': imageio_ffmpeg.get_ffmpeg_exe(),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '128',
        }],
        'quiet': True,
        'noplaylist': True
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([search_query])
        print(f"Fon müziği başarıyla indirildi: {output_path}")
    except Exception as e:
        print(f"Müzik indirme atlandı/hata verdi: {e}")

def process_video_task(topic: str, story_type: str, story_id: int, image_count: int = 5, include_bg_music: bool = True):
    """
    Arka planda çalışacak ana video üretim orkestrasyonu
    """
    db = SessionLocal()
    try:
        # 1. Hikaye ve Prompt Üretimi
        story_record = db.query(Story).filter(Story.id == story_id).first()
        if story_record:
            story_record.status_message = "Hikaye ve görsel taslakları oluşturuluyor..."
            db.commit()

        llm_result = generate_story_and_prompts(topic, story_type, image_count)
        story_text = llm_result["story"]
        prompts = llm_result["prompts"]
        
        # Veritabanını güncelle
        if story_record:
            story_record.story_text = story_text
            story_record.status_message = "Görseller, ses ve müzik hazırlanıyor..."
            db.commit()
            
        job_id = str(uuid.uuid4())
        # Her hikaye için kendi ID'si ile bir alt klasör oluşturuyoruz
        workspace_dir = os.path.join(os.path.abspath("media"), str(story_id))
        os.makedirs(workspace_dir, exist_ok=True)
        
        # Dosya yollarını hazırla
        image_paths = [os.path.join(workspace_dir, f"{job_id}_{i}.jpg") for i in range(len(prompts))]
        audio_path = os.path.join(workspace_dir, f"{job_id}.mp3")
        srt_path = os.path.join(workspace_dir, f"{job_id}.srt")
        bg_music_path = os.path.join(workspace_dir, f"{job_id}_bg.mp3")
        
        # 2 & 3. Görsel İndirme, TTS ve Müzik (PARALEL)
        print("Varlıklar (Görsel, Ses, Müzik) PARALEL olarak hazırlanıyor...")

        async def run_assets_parallel():
            # Görsel indirme işi
            def download_all():
                with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                    futures = [executor.submit(download_image, prompts[i], image_paths[i]) for i in range(len(prompts))]
                    concurrent.futures.wait(futures)

            image_task = asyncio.to_thread(download_all)
            tts_task = generate_audio_and_subs(story_text, audio_path, srt_path)
            
            tasks = [image_task, tts_task]
            if include_bg_music:
                music_task = asyncio.to_thread(download_bg_music, story_type, bg_music_path)
                tasks.append(music_task)

            await asyncio.gather(*tasks)

        # Mevcut event loop yönetimi
        try:
            asyncio.run(run_assets_parallel())
        except RuntimeError:
            loop = asyncio.new_event_loop()
            loop.run_until_complete(run_assets_parallel())

        print("Varlıklar hazır. Video birleştirme başlıyor...")
        if story_record:
            story_record.status_message = "Görseller ve altyazılar videoya gömülüyor..."
            db.commit()
        
        # 4. Video, Efekt ve Altyazı Birleştirme
        output_mp4 = os.path.join(workspace_dir, f"{job_id}_final.mp4")
        create_video_with_effects(image_paths, audio_path, srt_path, output_mp4)
        
        # İşlem tamam, DB güncelle
        if story_record:
            story_record.video_path = f"/media/{story_id}/{job_id}_final.mp4"
            story_record.status_message = "Tamamlandı"
            db.commit()
            
    except Exception as e:
        print(f"Video oluşturma hatası: {e}")
        if 'story_record' in locals() and story_record:
            story_record.status_message = f"Hata: {str(e)}"
            db.commit()
    finally:
        db.close()

@app.post("/api/generate")
def generate_video(request: VideoRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Kullanıcıdan konuyu alır, DB'ye yazar ve arkaplan görevini başlatır.
    """
    new_story = Story(topic=f"[{request.story_type}] {request.topic}", story_text="İşleniyor...")
    db.add(new_story)
    db.commit()
    db.refresh(new_story)
    
    background_tasks.add_task(
        process_video_task, 
        request.topic, 
        request.story_type, 
        new_story.id, 
        request.image_count, 
        request.include_bg_music
    )
    
    return {"message": "Video üretimi başlatıldı", "story_id": new_story.id}

@app.get("/api/stories")
def get_stories(db: Session = Depends(get_db)):
    """
    Tüm hikaye geçmişini getirir.
    """
    stories = db.query(Story).order_by(Story.id.desc()).all()
    return stories

@app.get("/api/trends")
def get_trends(story_type: str = "Genel"):
    """
    Google Trends'ten veya Haberler'den kategoriye göre popüler konuları getirir.
    """
    trends = get_trending_topics(category=story_type)
    return {"trends": trends}

@app.get("/api/balance")
def get_balance():
    """
    Pollinations hesabının güncel bakiye (Pollen) bilgisini döner.
    """
    import requests
    import os
    
    api_key = os.getenv("POLLINATIONS_API_KEY")
    if not api_key:
        return {"balance": 0}
        
    try:
        res = requests.get(
            "https://gen.pollinations.ai/account/balance",
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=5
        )
        if res.status_code == 200:
            return {"balance": res.json().get("balance", 0)}
        else:
            print(f"Bakiye okuma hatası: {res.text}")
            return {"balance": 0}
    except Exception as e:
        print(f"Bakiye servisine erişilemedi: {e}")
        return {"balance": 0}

@app.delete("/api/stories/{story_id}")
def delete_story(story_id: int, db: Session = Depends(get_db)):
    """
    Belirli bir hikayeyi siler ve ilgili tüm medya klasörünü temizler.
    """
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        return {"error": "Bulunamadı"}

    # İlgili klasörü sil
    import shutil
    folder_path = os.path.join("media", str(story_id))
    if os.path.exists(folder_path):
        try:
            shutil.rmtree(folder_path)
            print(f"Medya klasörü silindi: {folder_path}")
        except Exception as e:
            print(f"Klasör silinirken hata oluştu: {e}")

    db.delete(story)
    db.commit()
    return {"message": "Silindi"}

@app.get("/api/status/{story_id}")
def get_status(story_id: int, db: Session = Depends(get_db)):
    """
    Frontend'in videonun hazır olup olmadığını sorması için endpoint.
    """
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        return {"error": "Bulunamadı"}
        
    status = "completed" if story.video_path else "processing"
    
    return {
        "id": story.id,
        "topic": story.topic,
        "story_text": story.story_text,
        "status": status,
        "status_message": story.status_message,
        "video_url": story.video_path,
        "created_at": story.created_at.replace(tzinfo=timezone.utc) if story.created_at else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)