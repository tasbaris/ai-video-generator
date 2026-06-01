from pytrends.request import TrendReq

def get_trending_topics(region='TR'):
    """Google Trends üzerinden popüler konuları getirir."""
    try:
        pytrends = TrendReq(hl='tr-TR', tz=180)
        # Günlük yükselen aramaları al
        trending_df = pytrends.trending_searches(pn='turkey')
        topics = trending_df[0].tolist()
        return topics[:10] # İlk 10 konuyu dön
    except Exception as e:
        print(f"Trends hatası: {e}")
        return ["Teknoloji", "Uzay", "Doğa", "Tarih", "Yapay Zeka"] # Hata durumunda fallback
