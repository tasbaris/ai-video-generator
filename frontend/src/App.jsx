import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Video, FileText, Download, Plus, History, MessageSquare, Menu, X, Trash2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [topic, setTopic] = useState('');
  const [storyType, setStoryType] = useState('Genel');
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyId, setStoryId] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stories`);
      setHistory(res.data);
    } catch (err) {
      console.error("Geçmiş yüklenirken hata:", err);
    }
  };

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
        story_type: storyType
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

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Butona tıklandığında hikayeyi seçme
    if (!window.confirm("Bu hikayeyi silmek istediğinize emin misiniz?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/stories/${id}`);
      if (storyId === id) {
        startNew();
      }
      fetchHistory();
    } catch (err) {
      console.error("Silme hatası:", err);
    }
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
          {history.map((item) => (
            <div key={item.id} className="group relative">
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
                onClick={(e) => handleDelete(e, item.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Sil"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-center py-8 text-gray-600 text-sm">
              Henüz video üretilmedi.
            </div>
          )}
        </div>
      </div>

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

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <select
                    value={storyType}
                    onChange={(e) => setStoryType(e.target.value)}
                    className="px-4 py-5 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 md:w-48"
                    disabled={isGenerating}
                  >
                    <option value="Genel">Genel</option>
                    <option value="Belgesel">Belgesel</option>
                    <option value="Çocuk">Çocuk</option>
                    <option value="Korku">Korku</option>
                    <option value="Bilim Kurgu">Bilim Kurgu</option>
                    <option value="Tarih">Tarih</option>
                  </select>
                  <div className="relative flex-1 group">
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
              {error && <p className="text-red-500 mt-4 font-medium">{error}</p>}
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
