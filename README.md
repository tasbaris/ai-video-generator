# 🎬 AI Video Generator

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005863?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**AI Video Generator**, sadece bir konu başlığı girerek dakikalar içinde profesyonel video klipler oluşturan, uçtan uca otonom bir içerik üretim platformudur. 

---

## 🌟 Öne Çıkan Özellikler

- 🧠 **Otonom Senaryo Yazımı:** Google Gemini AI ile konuya özel, sürükleyici hikayeler ve görsel betimlemeler (promptlar).
- 📈 **Google Trends Entegrasyonu:** Türkiye'de anlık olarak popüler olan konuları keşfedin ve tek tıkla trend videolar üretin.
- 🎨 **Dinamik Görsel Üretimi:** Her sahne için yapay zeka tarafından özel olarak tasarlanmış, konseptle uyumlu görseller.
- 🎙️ **Doğal Seslendirme (TTS):** En gelişmiş yapay zeka sesleri ile profesyonel seslendirme ve otomatik senkronize altyazılar.
- 🎵 **Akıllı Fon Müziği:** Hikayenin moduna göre (Korku, Belgesel, Çocuk vb.) telifsiz fon müziklerini otomatik bulur ve ekler.
- 🎞️ **Sinematik Düzenleme:** Görseller arası `crossfade` geçiş efektleri ve TikTok/Reels tarzı modern, sarı vurgulu altyazılar.

---

## 📸 Ekran Görüntüsü

*(Buraya uygulamanın ekran görüntüsünü ekleyebilirsiniz)*
![App Preview](https://raw.githubusercontent.com/your-username/ai-video-generator/main/preview.png)

---

## 🛠️ Teknik Altyapı

| Alan | Teknoloji |
| :--- | :--- |
| **Backend** | FastAPI, SQLAlchemy, Pydantic |
| **Frontend** | React, Vite, Tailwind CSS, Lucide Icons |
| **AI (LLM)** | Google Gemini AI (3.1 Flash) |
| **Görüntü İşleme** | MoviePy, FFmpeg, Pillow |
| **Ses & Müzik** | Edge-TTS, yt-dlp |
| **Veri Kaynağı** | Google Trends (Pytrends) |

---

## 🚀 Hızlı Başlatma (Quick Start)

Projeyi en hızlı şekilde kurmak ve çalıştırmak için işletim sisteminize uygun scriptleri kullanabilirsiniz:

### 💻 Windows Kullanıcıları
1. **Kurulum:** `setup.bat` dosyasına çift tıklayın. (Sadece ilk seferde)
2. **Çalıştır:** `start.bat` dosyasına çift tıklayın.

### 🍎 Mac ve 🐧 Linux Kullanıcıları
1. Terminalinizi açın ve proje dizinine gidin.
2. **Kurulum:**
   ```bash
   ./setup.sh
   ```
3. **Çalıştır:**
   ```bash
   ./start.sh
   ```

> **Not (Windows Kullanıcıları için):** Video işleme ve altyazı gömme işlemleri için FFmpeg gereklidir. `setup.bat` bağımlılıkları yüklerken `imageio-ffmpeg` kütüphanesini kullanır, ancak sorun yaşarsanız FFmpeg'i manuel olarak indirip PATH'e eklemeniz gerekebilir. En kolay kurulum için PowerShell'e şu komutu yazabilirsiniz:
> `winget install ffmpeg`

---

## 🛠️ Manuel Kurulum

Eğer işlemleri adım adım yapmak isterseniz:

### 1. Backend Hazırlığı

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows için: .\venv\Scripts\activate
pip install -r requirements.txt
```

**`.env` Dosyasını Yapılandırın:**
`backend/` dizini içinde bir `.env` oluşturun:

```env
GEMINI_API_KEY=AIzaSy...
POLLINATIONS_API_KEY=sk_...
```

**Çalıştır:**

```bash
uvicorn app.main:app --reload
```

### 2. Frontend Hazırlığı

```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 Proje Amacı (Eğitim)

Bu proje, bir yazılım geliştirme sürecindeki tüm katmanları (Frontend, Backend, Database, AI Integration, Media Processing) kapsayan bir "full-stack" mühendislik çalışmasıdır. Modern yapay zeka araçlarının günlük içerik üretim süreçlerini nasıl otomatize edebileceğini kanıtlar niteliktedir.

---

## 📝 Lisans

Bu proje MIT lisansı altında korunmaktadır. Eğitim amaçlı kullanıma tamamen açıktır.
