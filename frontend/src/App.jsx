import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Video, FileText, Download, Plus, History, MessageSquare, Menu, X, Trash2, TrendingUp, RefreshCw, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [topic, setTopic] = useState('');
  const [storyType, setStoryType] = useState('Genel');
  const [imageCount, setImageCount] = useState(5);
  const [includeBgMusic, setIncludeBgMusic] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyId, setStoryId] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [imageQuota, setImageQuota] = useState(null);

  // Fetch history and trends on mount
  useEffect(() => {
    fetchHistory();
    fetchTrends();
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/balance`);
      // 1 resim = 0.001 pollen. Bakiye / 0.001 = kalan resim hakkı
      const pollen = res.data.balance || 0;
      const imagesLeft = Math.floor(pollen / 0.001);
      setImageQuota(imagesLeft);
    } catch (err) {
      console.error("Bakiye yüklenirken hata:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stories`);
      setHistory(res.data);
    } catch (err) {
      console.error("Geçmiş yüklenirken hata:", err);
    }
  };

  const fetchTrends = async () => {
    setIsLoadingTrends(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/trends`, {
        params: { story_type: storyType }
      });
      // Backend artık sadece "trends" dönüyor
      setTrends(Array.isArray(res.data.trends) ? res.data.trends : []);
    } catch (err) {
      console.error("Trendler yüklenirken hata:", err);
      setTrends([]);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  // Kategori (storyType) değiştiğinde trendleri yeniden çek
  useEffect(() => {
    fetchTrends();
  }, [storyType]);

  // Polling for video status
  useEffect(() => {
    let interval;
    if (storyId && (!videoData || videoData.status !== 'completed')) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/status/${storyId}`);
          setVideoData(res.data);

          if (res.data.status === 'completed') {
            setIsGenerating(false);
            clearInterval(interval);
            fetchHistory(); // Refresh history when a video is done
            fetchBalance(); // Kalan hakkı güncelle
          }
        } catch (err) {
          console.error("Durum kontrol hatası:", err);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [storyId, videoData?.status]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setVideoData(null);
    setError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/generate`, {
        topic,
        story_type: storyType,
        image_count: imageCount,
        include_bg_music: includeBgMusic
      });
      setStoryId(res.data.story_id);
      fetchHistory(); // Add to history immediately (as processing)
    } catch (err) {
      console.error(err);
      setError('Video üretimi başlatılırken bir hata oluştu.');
      setIsGenerating(false);
    }
  };

  const selectStory = async (id) => {
    setIsGenerating(false);
    setStoryId(id);
    setTopic('');
    try {
      const res = await axios.get(`${API_BASE_URL}/status/${id}`);
      setVideoData(res.data);
      if (res.data.status === 'processing') {
        setIsGenerating(true);
      }
    } catch (err) {
      console.error("Hikaye yüklenemedi:", err);
    }
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setStoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!storyToDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/stories/${storyToDelete}`);
      if (storyId === storyToDelete) {
        startNew();
      }
      fetchHistory();
    } catch (err) {
      console.error("Silme hatası:", err);
    } finally {
      setDeleteModalOpen(false);
      setStoryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setStoryToDelete(null);
  };

  const startNew = () => {
    setStoryId(null);
    setVideoData(null);
    setTopic('');
    setIsGenerating(false);
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} lg:w-72 bg-gray-900 h-full flex flex-col transition-all duration-300 z-40 overflow-hidden`}>
        <div className="p-4">
          <button
            onClick={startNew}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus size={20} />
            Yeni Video Oluştur
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <History size={14} />
            Geçmiş Videolar
          </div>
          <AnimatePresence mode="popLayout">
            {history.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group relative mb-1"
              >
                <button
                  onClick={() => selectStory(item.id)}
                  className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-start gap-3 ${storyId === item.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                    }`}
                >
                  <MessageSquare size={18} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="text-sm font-medium truncate">{item.topic}</div>
                    <div className="text-[10px] opacity-50 mt-1">ID: #{item.id}</div>
                  </div>
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, item.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Sil"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {history.length === 0 && (
            <div className="text-center py-8 text-gray-600 text-sm">
              Henüz video üretilmedi.
            </div>
          )}
        </div>

        {/* Quota Tracker */}
        {imageQuota !== null && (
          <div className="p-5 border-t border-gray-800 bg-gray-900/80 shrink-0">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-3">
              <span className="flex items-center gap-2"><Camera size={14} className="text-blue-500"/> Saatlik Resim Kotası</span>
              <span className={imageQuota < 20 ? 'text-red-400' : 'text-blue-400'}>{imageQuota} / 150</span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${imageQuota < 20 ? 'bg-red-500' : 'bg-blue-500'}`} 
                style={{ width: `${Math.min(Math.max((imageQuota / 150) * 100, 0), 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-500 mt-3 text-center flex items-center justify-center gap-1">
              <RefreshCw size={10} className="opacity-70" /> Her saat başı otomatik yenilenir
            </p>
          </div>
        )}
      </div>

      {/* Custom Delete Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Emin misiniz?</h3>
              <p className="text-center text-gray-500 mb-8">
                Bu hikayeyi ve oluşturulan videoyu kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors shadow-md shadow-red-200"
                >
                  Evet, Sil
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto bg-gray-50 relative">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {!storyId ? (
            <div className="max-w-2xl mx-auto text-center mt-20">
              <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-100 text-blue-600">
                <Video size={40} />
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Hayalindeki Videoyu <span className="text-blue-600">Hemen Üret</span>
              </h1>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                Konuyu yaz, görselleri, hikayeyi ve sesi yapay zeka senin için hazırlasın.
              </p>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <div className="flex flex-col items-start gap-1">
                    <label className="text-xs font-bold text-gray-500 ml-2">Tür</label>
                    <select
                      value={storyType}
                      onChange={(e) => setStoryType(e.target.value)}
                      className="px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 w-40"
                      disabled={isGenerating}
                    >
                      <option value="Genel">Genel</option>
                      <option value="Belgesel">Belgesel</option>
                      <option value="Siyaset">Siyaset</option>
                      <option value="Eğitim">Eğitim</option>
                      <option value="Çocuk">Çocuk</option>
                      <option value="Korku">Korku</option>
                      <option value="Tarih">Tarih</option>
                      <option value="Spor">Spor</option>
                      <option value="Televizyon">Televizyon</option>
                      <option value="Teknoloji">Teknoloji</option>
                      <option value="Magazin">Magazin</option>
                    </select>
                  </div>

                  <div className="flex flex-col items-start gap-1">
                    <label className="text-xs font-bold text-gray-500 ml-2">Resim Adeti</label>
                    <select
                      value={imageCount}
                      onChange={(e) => setImageCount(parseInt(e.target.value))}
                      className="px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 w-32"
                      disabled={isGenerating}
                    >
                      {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n} Resim</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col items-start gap-1">
                    <label className="text-xs font-bold text-gray-500 ml-2">Arkplan Müziği</label>
                    <div
                      onClick={() => !isGenerating && setIncludeBgMusic(!includeBgMusic)}
                      className={`flex items-center gap-3 px-4 py-3 bg-white border-2 rounded-2xl cursor-pointer transition-all ${includeBgMusic ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${includeBgMusic ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                        }`}>
                        {includeBgMusic && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className={`font-bold text-sm w-12 text-left inline-block ${includeBgMusic ? 'text-blue-700' : 'text-gray-500'}`}>
                        {includeBgMusic ? 'Açık' : 'Kapalı'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="max-w-2xl mx-auto w-full">
                  <div className="flex justify-start mb-2 h-6 pl-2">
                    <AnimatePresence>
                      {topic && !isGenerating && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          type="button"
                          onClick={() => setTopic('')}
                          className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1.5 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={14} /> Metni Temizle
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative group w-full">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Videonun konusu ne olsun?"
                      className="w-full px-6 py-5 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg shadow-sm group-hover:shadow-md pr-32"
                    />
                    <button
                      type="submit"
                      disabled={isGenerating || !topic.trim()}
                      className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isGenerating ? <Loader2 className="animate-spin" size={20} /> : 'Üret'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Trends Section */}
              <div className="mt-10 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-lg text-left">
                    <TrendingUp size={20} className="text-blue-600" />
                    {storyType === 'Genel' ? 'Günün Trend Konuları (Türkiye)' : `${storyType} Gündemi`}
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); fetchTrends(); }}
                    className="group flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg text-xs font-bold transition-all border border-gray-100 hover:border-blue-100"
                    disabled={isLoadingTrends}
                  >
                    <RefreshCw size={14} className={`${isLoadingTrends ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    Yenile
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  {Array.isArray(trends) && trends.length > 0 ? (
                    trends.map((trend, idx) => {
                      return (
                        <button
                          key={idx}
                          onClick={() => setTopic(prev => prev ? `${prev}, ${trend}` : trend)}
                          className="pl-3 pr-4 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border-2 bg-white border-gray-100 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm"
                        >
                          <span className="text-[10px] w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            {idx + 1}
                          </span>
                          {trend}
                          <Plus size={16} className="ml-1 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })
                  ) : (
                    !isLoadingTrends && (
                      <div className="text-center py-4 w-full">
                        <p className="text-gray-400 text-sm italic">Şu an gösterilecek canlı trend bulunamadı.</p>
                      </div>
                    )
                  )}
                  {isLoadingTrends && (
                    <div className="flex flex-wrap gap-3 justify-center w-full">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="w-32 h-10 bg-gray-100 animate-pulse rounded-2xl"></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="text-red-500 mt-6 text-center font-medium bg-red-50 p-4 rounded-2xl border border-red-100">{error}</p>}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Content Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{videoData?.topic}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${videoData?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {videoData?.status === 'completed' ? 'Tamamlandı' : 'Üretiliyor...'}
                    </span>
                    <span className="text-gray-400 text-sm">ID: #{videoData?.id}</span>
                  </div>
                </div>
                {videoData?.status === 'completed' && (
                  <a
                    href={`http://localhost:8000${videoData.video_url}`}
                    download
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-xl font-bold transition-all"
                  >
                    <Download size={20} />
                    İndir
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left: Video Player */}
                <div className="lg:col-span-2">
                  <div className="aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-200 relative group">
                    {videoData?.status === 'completed' && videoData.video_url ? (
                      <video
                        src={`http://localhost:8000${videoData.video_url}`}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <h4 className="text-white font-bold mb-2">Video Hazırlanıyor</h4>
                        <p className="text-gray-500 text-xs">Yapay zeka sahneleri birleştiriyor...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Story Details */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 text-blue-600 mb-4">
                      <FileText size={24} />
                      <h3 className="text-xl font-bold">Hikaye Metni</h3>
                    </div>
                    {videoData?.story_text && videoData.story_text !== 'İşleniyor...' ? (
                      <p className="text-gray-700 leading-relaxed text-lg italic bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        "{videoData.story_text}"
                      </p>
                    ) : (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    )}
                  </div>

                  {videoData?.status === 'processing' && (
                    <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-lg shadow-blue-200 overflow-hidden relative">
                      <div className="relative z-10">
                        <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                          <Loader2 className="animate-spin" size={20} />
                          Optimizasyon Devrede
                        </h4>
                        <p className="text-blue-100 leading-relaxed">
                          Görseller paralel indiriliyor ve seslendirme aynı anda yapılıyor. Yaklaşık 30-40 saniye içinde videon hazır olacak.
                        </p>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
}

export default App;
