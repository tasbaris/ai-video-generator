# AI Video Generator

Bu proje, yapay zeka kullanarak otomatik video klipler oluşturan bir uygulamadır. FastAPI (Backend) ve React/Vite (Frontend) kullanılarak geliştirilmiştir.

## Proje Yapısı

- `backend/`: FastAPI sunucusu ve video üretim mantığı.
- `frontend/`: React tabanlı kullanıcı arayüzü.

---

## 🚀 Başlangıç (Kurulum)

### Gereksinimler

- **Python 3.10+**
- **Node.js (v18+)**
- **FFmpeg** (Video işleme için gereklidir)

---

### 1. Backend Kurulumu

#### Windows

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

#### macOS / Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Ortam Değişkenleri:**
`backend/` klasörü içinde bir `.env` dosyası oluşturun ve gerekli API anahtarlarınızı ekleyin:

```env
GEMINI_API_KEY=your_api_key_here
```

**Çalıştırma:**

```bash
uvicorn app.main:app --reload
```

---

### 2. Frontend Kurulumu

#### Her iki platform için

```bash
cd frontend
npm install
```

**Çalıştırma:**

```bash
npm run dev
```

Frontend varsayılan olarak `http://localhost:5173` adresinde çalışacaktır.

---

## 🧠 Çalışma Mantığı (İş Akışı)

Bu uygulama, karmaşık bir video üretim sürecini tam otomatik hale getirir. İşte adım adım sürecin işleyişi:

1.  **İçerik Üretimi (Gemini AI):** Kullanıcının girdiği konu, Google Gemini API'sine gönderilir. Yapay zeka, konuyla ilgili sürükleyici bir **hikaye** ve bu hikayenin her sahnesi için görsel oluşturmaya uygun **promptlar (betimlemeler)** hazırlar.
2.  **Varlıkların Hazırlanması (Paralel İşlem):** Verimliliği artırmak için şu üç işlem aynı anda gerçekleştirilir:
    *   **Görsel Temini:** Üretilen promptlar kullanılarak hikayeye uygun görseller internet üzerinden çekilir.
    *   **Seslendirme (TTS):** Hikaye metni, `edge-tts` kütüphanesi kullanılarak doğal bir yapay zeka sesiyle seslendirilir. Aynı zamanda sesle senkronize bir altyazı dosyası (.srt) oluşturulur.
    *   **Fon Müziği:** `yt-dlp` kütüphanesi, hikaye türüne uygun, telifsiz ve enstrümantal bir müzik bulup indirir.
3.  **Video Birleştirme (MoviePy):** Toplanan tüm parçalar (görseller, seslendirme, fon müziği ve altyazılar) `moviepy` motoru kullanılarak bir araya getirilir. Görsellere kaydırma/yakınlaştırma efektleri eklenir ve profesyonel bir video dosyası oluşturulur.
4.  **Sunum:** Tamamlanan video kullanıcı arayüzünde gösterilir ve `backend/media` klasöründe saklanır.

---

## 🛠 Kullanılan Teknolojiler

### Backend

- **FastAPI:** Hızlı ve modern web framework.
- **SQLAlchemy:** Veritabanı (SQLite) yönetimi.
- **MoviePy:** Video düzenleme ve birleştirme.
- **Edge-TTS:** Yapay zeka seslendirme.
- **Google Generative AI (Gemini):** İçerik üretimi.

### Frontend

- **React:** Kullanıcı arayüzü.
- **Vite:** Hızlı geliştirme ortamı.
- **Tailwind CSS:** Modern tasarım (Eğer kullanıldıysa).

---

## 📦 Bağımlılıklar

### FFmpeg Kurulumu

Videoların oluşturulabilmesi için sisteminizde FFmpeg yüklü olmalıdır:

- **Windows:** [Gyan.dev](https://www.gyan.dev/ffmpeg/builds/) sitesinden indirip PATH'e ekleyin.
- **macOS:** `brew install ffmpeg`

---

## 📝 Notlar

- Video üretimi sırasında internet bağlantınızın olduğundan ve API anahtarlarınızın geçerli olduğundan emin olun.
- Oluşturulan videolar `backend/media/` klasörüne kaydedilir.
