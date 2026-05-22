import os
import shutil
import subprocess
import imageio_ffmpeg
from moviepy.editor import ImageClip, AudioFileClip, CompositeAudioClip, concatenate_videoclips
import moviepy.audio.fx.all as afx

def create_video_with_effects(image_paths, audio_path, srt_path, output_mp4):
    print("Video birleştirme işlemi başlatılıyor...")
    
    # 1. Ses ve Müzik
    tts_audio = AudioFileClip(audio_path)
    duration = tts_audio.duration
    
    bg_music_path = audio_path.replace(".mp3", "_bg.mp3")
    if os.path.exists(bg_music_path):
        print("Fon müziği eklendi.")
        bg_music = AudioFileClip(bg_music_path).fx(afx.volumex, 0.1)
        bg_music = afx.audio_loop(bg_music, duration=duration)
        final_audio = CompositeAudioClip([tts_audio, bg_music])
    else:
        final_audio = tts_audio
        
    # 2. Görseller
    clips = []
    num_images = len(image_paths)
    duration_per_image = duration / num_images if num_images > 0 else 5
    
    for img_path in image_paths:
        if os.path.exists(img_path):
            clip = ImageClip(img_path).set_duration(duration_per_image)
            clips.append(clip)
            
    if not clips:
        raise Exception("Görsel bulunamadı!")
        
    base_video = concatenate_videoclips(clips, method="compose")
    base_video = base_video.set_audio(final_audio)
    
    # 3. Geçici Ana Videoyu Çıkart (Sadece Görüntü + Ses)
    temp_base = output_mp4.replace(".mp4", "_temp.mp4")
    base_video.write_videofile(temp_base, fps=24, codec="libx264", audio_codec="aac")
    
    # 4. FFMPEG İle Kusursuz Altyazı Gömme (ImageMagick kullanılmaz)
    if os.path.exists(srt_path):
        print("FFMPEG ile altyazı videoya gömülüyor...")
        
        # FFMPEG path sorunlarını (Mac'te sık yaşanır) çözmek için 
        # srt dosyasını çalıştığımız dizine basit isimle kopyalıyoruz
        temp_srt = "temp_sub.srt"
        shutil.copy2(srt_path, temp_srt)
        
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        
        # FontSize 14'e düştü, MarginV 60 ile ekranın altına çekildi    
        force_style = "FontName=Arial,FontSize=14,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=1.5,Shadow=0.5,Alignment=2,MarginV=40"      
        cmd = [
            ffmpeg_exe, "-y",
            "-i", temp_base,
            "-vf", f"subtitles={temp_srt}:force_style='{force_style}'",
            "-c:a", "copy",
            "-preset", "ultrafast",
            output_mp4
        ]
        
        try:
            # Komutu çalıştır (Gömme işlemi)
            subprocess.run(cmd, check=True, capture_output=True)
            print("Altyazı başarıyla videoya gömüldü!")
        except subprocess.CalledProcessError as e:
            # Eğer hata verirse konsola FFMPEG'in kendi hatasını basalım
            print(f"FFMPEG Gömme Hatası: {e.stderr.decode()}")
            os.rename(temp_base, output_mp4) # Hata olursa orijinal (altyazısız) videoyu kurtar
        finally:
            # Çöpleri temizle
            if os.path.exists(temp_srt):
                os.remove(temp_srt)
            if os.path.exists(temp_base):
                os.remove(temp_base)
    else:
        print("Uyarı: SRT dosyası yok. Altyazısız kaydedildi.")
        os.rename(temp_base, output_mp4)