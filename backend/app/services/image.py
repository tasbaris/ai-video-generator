import requests
import random
import time
import base64

def download_image(prompt: str, save_path: str) -> str:
    # Çok uzun promptları kırpıyoruz
    clean_prompt = prompt[:400]
    enhanced_prompt = f"{clean_prompt}, vertical portrait 9:16 aspect ratio, high resolution"

    max_retries = 5
    
    # Pollinations API Key ve Header ayarları
    api_key = "YOUR_POLLINATIONS_API_KEY"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    url = "https://gen.pollinations.ai/v1/images/generations"
    
    for attempt in range(max_retries):
        try:
            print(f"Görsel oluşturuluyor (Deneme {attempt + 1}/{max_retries})...")
            
            # Yeni POST Payload yapısı
            payload = {
                "prompt": enhanced_prompt,
                "model": "flux",
                "n": 1,
                "size": "768x1344", # 9:16 için
                "quality": "medium",
                "response_format": "b64_json",
                "seed": random.randint(1, 999999999)
            }
            
            res = requests.post(url, headers=headers, json=payload, timeout=60)
            
            if res.status_code == 200:
                data = res.json()
                b64_data = data.get("data", [{}])[0].get("b64_json")
                
                if b64_data:
                    # Gelen base64 verisini çözüp resim olarak kaydediyoruz
                    with open(save_path, "wb") as f:
                        f.write(base64.b64decode(b64_data))
                    print(f"Başarılı! Görsel kaydedildi: {save_path}")
                    return save_path
                else:
                    print("Hata: API yanıtında 'b64_json' verisi bulunamadı.")
                    time.sleep(3)
                    
            elif res.status_code == 429:
                print("Hız sınırına takıldı, 5 saniye bekleniyor...")
                time.sleep(5)
            else:
                print(f"Hata Kodu: {res.status_code} - {res.text[:100]}")
                time.sleep(3)
                
        except Exception as e:
            print(f"Bağlantı hatası: {e}")
            if attempt < max_retries - 1:
                print("5 saniye bekleyip tekrar deneniyor...")
                time.sleep(5)
            
    raise Exception(f"Tüm denemelere rağmen resim oluşturulamadı: {save_path}")