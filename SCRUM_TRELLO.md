# AI Video Generator - Detaylı Scrum Planı (Trello Uyumlu)

Bu dosya, Trello board'unuza kolayca taşıyabilmeniz için genişletilmiş sprint ve görev detaylarını içerir.

## Story Point Skalası (Fibonacci)

- **1, 2, 3:** Küçük işler (UI düzenlemeleri, DB tabloları)
- **5:** Orta dereceli işler (LLM entegrasyonu, TTS motoru)
- **8:** Karmaşık işler (Video render orkestrasyonu, Efekt senkronizasyonu)

---

## 🟢 SPRINT 1: Altyapı ve Metin Üretimi (Foundation)

**Hedef:** Sistemin iskeletini kurmak ve LLM ile hikaye akışını sağlamak.

### Story 1: LLM ile Hikaye ve Prompt Oluşturma (5 SP)

- **Görevler:**
  - [x] Gemini API entegrasyonu.
  - [x] Sistematik "Prompt Engineering" (Korku, Çocuk, Belgesel türleri).
  - [x] JSON çıktı formatının standardize edilmesi.
- **Kabul Kriterleri:** Kullanıcı konu girdiğinde 150 kelimelik hikaye ve 5 görsel promptu JSON olarak dönmeli.

### Story 2: Veri Kalıcılığı ve Geçmiş (3 SP)

- **Görevler:**
  - [x] SQLAlchemy modellerinin tasarımı (Story tablosu).
  - [x] SQLite veritabanı bağlantısı.
  - [x] API üzerinden geçmiş hikayelerin listelenmesi ve silinmesi.
- **Kabul Kriterleri:** Her üretim isteği DB'ye kaydedilmeli ve frontend geçmiş listesinde görünmeli.

---

## 🟡 SPRINT 2: Medya Bileşenleri ve Ses (Media)

**Hedef:** Hikayeyi görsel ve işitsel unsurlarla zenginleştirmek.

### Story 3: Görsel Üretim Motoru (5 SP)

- **Görevler:**
  - [x] Pollinations AI/Flux entegrasyonu.
  - [x] Görsellerin 9:16 formatında ve yüksek kalitede indirilmesi.
  - [x] Hata yönetimi ve retry (yeniden deneme) mekanizması.
- **Kabul Kriterleri:** Her hikaye için en az 5 adet sahneyle uyumlu görsel `/media` klasörüne inmeli.

### Story 4: TTS ve Altyazı Senkronizasyonu (5 SP)

- **Görevler:**
  - [x] Edge-TTS entegrasyonu (tr-TR-AhmetNeural).
  - [x] Kelime zamanlamalarının (Word Boundaries) hesaplanması.
  - [x] .SRT dosyası oluşturma mantığı.
- **Kabul Kriterleri:** Ses dosyası üretilmeli ve sesle tam uyumlu SRT dosyası hazır olmalı.

---

## 🔴 SPRINT 3: Video Sentezi ve Cila (Finalization)

**Hedef:** Tüm parçaları birleştirip nihai ürünü sunmak.

### Story 5: Video Render Orkestrasyonu (8 SP)

- **Görevler:**
  - [x] MoviePy ile görsel ve seslerin birleştirilmesi.
  - [x] Arka plan müziğinin (yt-dlp) otomatik indirilmesi ve mikslenmesi.
  - [x] Async arka plan görevi (BackgroundTasks) yönetimi.
- **Kabul Kriterleri:** Kullanıcıya indirme linki içeren nihai bir MP4 sunulmalı.

### Story 6: Geçiş Efektleri ve Görsel Estetik (3 SP)

- **Görevler:**
  - [x] Klipler arasına Crossfade (geçiş) eklenmesi.
  - [x] Video süresinin ses süresine göre dinamik ayarlanması.
- **Kabul Kriterleri:** Görseller arası geçişler keskin değil, yumuşak (fade) olmalı.

### Story 7: Altyazı Gömme (Hard-sub) (3 SP)

- **Görevler:**
  - [x] FFMPEG subprocess yönetimi.
  - [x] Altyazı stili (Font, Renk, Pozisyon) optimizasyonu.
- **Kabul Kriterleri:** Video üzerinde okunabilir, senkronize altyazılar kalıcı olarak görünmeli.

---

## 🔵 SPRINT 4: İleri Seviye Özellikler & UX (Advanced)

**Hedef:** Projeyi profesyonel bir ürün seviyesine taşımak.

### Story 8: Akıllı İçerik ve Trend Entegrasyonu (5 SP)

- **Görevler:**
  - [x] Google Trends API ile güncel Türkiye gündeminin çekilmesi.
  - [x] Kategori bazlı (Spor, Magazin, Teknoloji vb.) trend filtreleme.
- **Kabul Kriterleri:** Kullanıcı tek tıkla gündemdeki konuları video konusu olarak seçebilmeli.

### Story 9: Otomatik Fon Müziği ve Paralelizasyon (5 SP)

- **Görevler:**
  - [x] yt-dlp ile YouTube üzerinden telifsiz enstrümantal müziklerin tespiti ve indirilmesi.
  - [x] Python `asyncio` ve `concurrent.futures` ile görsel/ses/müzik hazırlığının paralel yürütülmesi.
- **Kabul Kriterleri:** Video üretim hızı hissedilir şekilde artmalı ve her videoda türüne uygun fon müziği olmalı.

---

## 📋 Trello İçin Kolon Önerisi

1. **Backlog:** Henüz planlanmamış fikirler.
2. **Sprint Backlog:** Mevcut sprintte yapılacaklar.
3. **In Progress:** Şu an üzerinde çalışılanlar.
4. **Testing/Review:** Kod bitti, deneme yapılıyor.
5. **Done:** Tamamlananlar.
