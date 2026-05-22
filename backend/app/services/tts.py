import edge_tts
import asyncio
import os
import re

def parse_srt_time(time_str: str) -> int:
    """SRT zaman damgasını milisaniyeye çevirir."""
    h, m, s, ms = map(int, re.split('[:,]', time_str))
    return (h * 3600 + m * 60 + s) * 1000 + ms

def format_srt_time(milliseconds: float) -> str:
    """Milisaniyeyi SRT zaman formatına (HH:MM:SS,mmm) çevirir."""
    seconds = milliseconds / 1000.0
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    milis = int(round((seconds - int(seconds)) * 1000))
    return f"{hours:02}:{minutes:02}:{secs:02},{milis:03}"

def enforce_max_words(srt_content: str, max_words: int = 5) -> str:
    """Uzun SRT cümlelerini süreleriyle birlikte maksimum N kelimelik parçalara böler."""
    blocks = srt_content.strip().split('\n\n')
    new_blocks = []
    sub_idx = 1
    
    for block in blocks:
        lines = block.split('\n')
        if len(lines) >= 3:
            times = lines[1].split(' --> ')
            start_ms = parse_srt_time(times[0])
            end_ms = parse_srt_time(times[1])
            
            text = " ".join(lines[2:])
            words = text.split()
            
            if len(words) <= max_words:
                new_blocks.append(f"{sub_idx}\n{format_srt_time(start_ms)} --> {format_srt_time(end_ms)}\n{text}")
                sub_idx += 1
            else:
                # Süreyi kelime sayısına bölerek matematiksel paylaştırma
                chunk_duration = (end_ms - start_ms) / len(words)
                for i in range(0, len(words), max_words):
                    chunk_words = words[i:i+max_words]
                    chunk_start = start_ms + (i * chunk_duration)
                    chunk_end = start_ms + ((i + len(chunk_words)) * chunk_duration)
                    
                    chunk_text = " ".join(chunk_words)
                    new_blocks.append(f"{sub_idx}\n{format_srt_time(chunk_start)} --> {format_srt_time(chunk_end)}\n{chunk_text}")
                    sub_idx += 1
    return "\n\n".join(new_blocks) + "\n\n"

async def generate_audio_and_subs(text: str, audio_path: str, srt_path: str):
    voice = "tr-TR-AhmetNeural"
    communicate = edge_tts.Communicate(text, voice)
    
    submaker = edge_tts.SubMaker()
    word_boundaries = []
    
    with open(audio_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] in ["WordBoundary", "SentenceBoundary"]:
                submaker.feed(chunk)
                if chunk["type"] == "WordBoundary":
                    # Senkron kaymasını eşitlemek için -200ms (0.20 sn) geri itiyoruz
                    SYNC_DELAY = -200 
                    offset_ms = (chunk["offset"] / 10000) + SYNC_DELAY
                    duration_ms = chunk["duration"] / 10000
                    word_boundaries.append({
                        "text": chunk["text"],
                        "start": offset_ms,
                        "end": offset_ms + duration_ms
                    })
                    
    srt_content = ""
    
    # 1. Eğer model doğrudan kelime bazlı sınır veriyorsa (Şanslıysak)
    if len(word_boundaries) > 0:
        WORDS_PER_SUB = 5
        sub_index = 1
        for i in range(0, len(word_boundaries), WORDS_PER_SUB):
            group = word_boundaries[i:i + WORDS_PER_SUB]
            start_time = group[0]["start"]
            end_time = group[-1]["end"]
            sub_text = " ".join([w["text"] for w in group])
            
            srt_content += f"{sub_index}\n"
            srt_content += f"{format_srt_time(start_time)} --> {format_srt_time(end_time)}\n"
            srt_content += f"{sub_text}\n\n"
            sub_index += 1
    else:
        # 2. Model sadece uzun cümle veriyorsa, cümleyi al ve matematiksel olarak 5'e böl
        raw_srt = submaker.get_srt()
        if not raw_srt.strip():
            raw_srt = "1\n00:00:00,000 --> 00:00:05,000\n(Ses oynatılıyor...)\n\n"
            
        srt_content = enforce_max_words(raw_srt, max_words=5)

    with open(srt_path, "w", encoding="utf-8") as f:
        f.write(srt_content)
        
    print(f"Altyazı dosyası sabit ve kısa oluşturuldu: {srt_path}")
    return audio_path, srt_path