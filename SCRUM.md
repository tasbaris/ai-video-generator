# Çevik Dönem Projesi - Scrum Board

## Proje: AI Video Generator

### Story Points Tanımları
- 1: Çok Kolay
- 2: Kolay
- 3: Orta
- 5: Zor
- 8: Çok Zor

### Product Backlog

| ID | Story | Story Point | Durum |
|----|-------|-------------|-------|
| 1 | LLM’ile program içerisinden promt oluşturma | 3 | Tamamlandı |
| 2 | Oluşan hikayenin veri tabanına kaydedilmesi | 2 | Tamamlandı |
| 3 | Hikaye temelli en az 3 görselin LLM’ile oluşturulması | 3 | Tamamlandı |
| 4 | LLM’in oluşturduğu hikâyenin ses’e dönüştürülmesi | 5 | Tamamlandı |
| 5 | Ses ve Görseller oluşturularak videonun oluşturulması | 5 | Tamamlandı |
| 6 | Videonun içerisinde görsel geçişlerinde efekt eklenmesi | 3 | Tamamlandı |
| 7 | Oluşturulan videoya alt yazı eklenmesi | 3 | Tamamlandı |

### Sprint 1 (Bitti)
- **Hedef:** Tüm temel fonksiyonların ve görsel efektlerin tamamlanması.
- **Sonuç:** Tüm isterler başarıyla tamamlandı.

### Tamamlanan İşler Review
- LLM entegrasyonu (Gemini) ile hikaye ve prompt üretimi başarılı.
- SQLite + SQLAlchemy ile veri kalıcılığı sağlandı.
- Pollinations AI ile görsel üretimi entegre edildi.
- Edge-TTS ile kaliteli Türkçe seslendirme yapılıyor.
- MoviePy ile video birleştirme ve FFMPEG ile altyazı gömme işlemleri çalışıyor.
