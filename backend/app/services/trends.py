import requests
import xml.etree.ElementTree as ET
import urllib.parse

def get_trending_topics(region='TR', category='Genel'):
    """Tür (kategori) seçimine göre Google Trends veya Google Haberler üzerinden veri çeker."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        if category == 'Genel':
            # Genel kategori için klasik Google Trends (Son 24 saat gerçek arama trendleri)
            url = f"https://trends.google.com/trending/rss?geo={region}"
        else:
            # Belirli kategoriler için o anki güncel haberleri arayarak trend oluşturuyoruz
            queries = {
                "Belgesel": "doğa OR belgesel OR Vahşi Yaşam OR National Geographic OR Discovery OR BBC Earth",
                "Siyaset": "siyaset OR seçim OR hükümet OR meclis OR cumhurbaşkanı OR parti",
                "Eğitim": "eğitim OR okul OR üniversite OR öğretmen OR öğrenci OR sınav",
                "Çocuk": "çizgi film OR animasyon OR oyuncak OR masal", # Eğitim/Bakanlık yerine eğlence odaklı
                "Korku": "gizem OR gerilim OR paranormal",
                "Tarih": "tarih OR arkeoloji OR antik OR medeniyet OR savaş OR imparatorluk",
                "Spor": "futbol OR tenis OR spor OR lig OR Dünya Kupası OR Şampiyonlar Ligi OR transfer",
                "Televizyon": "televizyon OR dizi OR sinema OR film OR tiyatro",
                "Teknoloji": "teknoloji OR yapay zeka OR akıllı cihazlar OR mobil OR bilgisayar OR yazılım OR donanım",
                "Magazin": "magazin OR ünlü OR dedikodu",
            }
            # Eğer eşleşmezse varsayılan bir kelime kullan
            q = queries.get(category, "gündem")
            encoded_q = urllib.parse.quote(q)
            # Google News RSS arama endpoint'i
            url = f"https://news.google.com/rss/search?q={encoded_q}&hl=tr&gl=TR&ceid=TR:tr"

        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            root = ET.fromstring(response.text)
            real_trends = []

            # RSS içindeki <item> etiketlerini tara
            for item in root.findall('.//item'):
                title_elem = item.find('title')
                if title_elem is not None and title_elem.text:
                    title = title_elem.text
                    # Google News başlıklarında haber kaynağı da yazar (Örn: "... - Hürriyet"), onu temizliyoruz
                    if category != 'Genel' and " - " in title:
                        title = title.rsplit(" - ", 1)[0]
                    real_trends.append(title)

            return real_trends[:10]
        else:
            print(f"RSS Hatası: {response.status_code}")
            return []

    except Exception as e:
        print(f"Trends Hatası: {e}")
        return []
