
import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah, Bookmark, ActiveAudio } from '../types';
import { SearchIcon, ArrowLeftIcon, BayanLogo, SpeakerIcon } from './Icons';

interface QuranExplorerProps {
  onAudioStateChange: (audio: ActiveAudio | null) => void;
  activeAudio: ActiveAudio | null;
}

const QuranExplorer: React.FC<QuranExplorerProps> = ({ onAudioStateChange, activeAudio }) => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [audioLoading, setAudioLoading] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [surahProgress, setSurahProgress] = useState<Record<number, number>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSurahs();
    loadBookmarks();
    loadFavorites();
    loadProgress();
  }, []);

  useEffect(() => {
    const handleGlobalStop = () => {
      if (audioRef.current) audioRef.current.pause();
      setAudioLoading(null);
      setIsAutoPlaying(false);
    };
    window.addEventListener('almalik_stop_audio', handleGlobalStop);
    return () => window.removeEventListener('almalik_stop_audio', handleGlobalStop);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    setShowScrollTop(top > 1000);
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadBookmarks = () => {
    const saved = localStorage.getItem('almalik_bookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('almalik_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  };

  const toggleFavorite = (surahNum: number, ayahNum: number) => {
    const key = `${surahNum}:${ayahNum}`;
    let newFavs = [...favorites];
    if (newFavs.includes(key)) {
      newFavs = newFavs.filter(f => f !== key);
    } else {
      newFavs.push(key);
    }
    setFavorites(newFavs);
    localStorage.setItem('almalik_favorites', JSON.stringify(newFavs));
  };

  const loadProgress = () => {
    const saved = localStorage.getItem('almalik_surah_progress');
    if (saved) setSurahProgress(JSON.parse(saved));
  };

  const updateProgress = (surahNumber: number, ayahNumber: number, totalAyahs: number) => {
    const percentage = Math.round((ayahNumber / totalAyahs) * 100);
    const newProgress = { ...surahProgress, [surahNumber]: percentage };
    setSurahProgress(newProgress);
    localStorage.setItem('almalik_surah_progress', JSON.stringify(newProgress));
  };

  const fetchSurahs = async () => {
    try {
      const res = await fetch('https://api.alquran.cloud/v1/surah');
      const data = await res.json();
      setSurahs(data.data);
    } catch (err) {
      console.error("Failed to fetch surahs", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAyahs = async (surahNumber: number, targetAyah?: number) => {
    setLoading(true);
    onAudioStateChange(null);
    setAudioLoading(null);
    setIsAutoPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,ur.jalandhry,ar.alafasy`);
      const data = await res.json();
      const combined = data.data[0].ayahs.map((a: any, i: number) => ({
        number: a.numberInSurah,
        text: a.text,
        translation: data.data[1].ayahs[i].text,
        urduTranslation: data.data[2].ayahs[i].text,
        audio: data.data[3].ayahs[i].audio
      }));
      setAyahs(combined);
      
      if (targetAyah) {
        setTimeout(() => {
          document.getElementById(`ayah-${targetAyah}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    } catch (err) {
      console.error("Failed to fetch ayahs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSurahClick = (surah: Surah) => {
    setSelectedSurah(surah);
    fetchAyahs(surah.number);
    scrollToTop();
  };

  const playAyah = (ayahNumber: number, audioUrl: string) => {
    if (!audioRef.current) return;

    if (activeAudio?.id === `ayah-${ayahNumber}` || audioLoading === ayahNumber) {
      audioRef.current.pause();
      onAudioStateChange(null);
      setAudioLoading(null);
      setIsAutoPlaying(false);
      return;
    }

    setAudioLoading(ayahNumber);
    onAudioStateChange(null);
    
    audioRef.current.src = audioUrl;
    audioRef.current.play().then(() => {
      setAudioLoading(null);
      onAudioStateChange({
        id: `ayah-${ayahNumber}`,
        title: selectedSurah?.englishName || 'Ayah',
        subtitle: `RECITATION - Verse ${ayahNumber}`,
        type: 'ayah'
      });
      if (selectedSurah) updateProgress(selectedSurah.number, ayahNumber, selectedSurah.numberOfAyahs);
      document.getElementById(`ayah-${ayahNumber}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }).catch(() => {
      setAudioLoading(null);
      onAudioStateChange(null);
      setIsAutoPlaying(false);
    });
  };

  const handleAudioEnd = () => {
    if (isAutoPlaying && activeAudio?.id.startsWith('ayah-')) {
      const currentAyahNum = parseInt(activeAudio.id.replace('ayah-', ''));
      const nextIndex = currentAyahNum; // index is ayah.number since they are 1-based
      if (nextIndex < ayahs.length) {
        playAyah(ayahs[nextIndex].number, ayahs[nextIndex].audio!);
      } else {
        setIsAutoPlaying(false);
        onAudioStateChange(null);
      }
    } else {
      onAudioStateChange(null);
    }
  };

  const getEnglishTranslationOnly = (surah: Surah) => {
    if (surah.number === 1) return "THE OPENING";
    if (surah.number === 2) return "THE COW";
    return surah.englishNameTranslation.toUpperCase();
  };

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(search.toLowerCase()) || 
    s.name.includes(search) ||
    s.number.toString() === search
  );

  if (loading && surahs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
        <BayanLogo className="w-16 h-16 animate-sacred-glow text-gold" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20 relative" onScroll={handleScroll}>
      <audio ref={audioRef} onEnded={handleAudioEnd} className="hidden" />
      
      {!selectedSurah ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-slate-200 dark:border-slate-800 px-2">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white playfair italic">THE HOLY QURAN</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-base font-bold uppercase tracking-widest">Read and listen with Urdu & English translations</p>
            </div>
            <div className="relative w-full md:w-96 group">
              <input 
                type="text" 
                placeholder="Search Surah"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-navy-900 border-2 border-slate-100 dark:border-slate-800 rounded-full py-4 pl-12 pr-6 text-sm font-bold focus:border-gold outline-none transition-all shadow-sm"
              />
              <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-gold transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-2">
            {filteredSurahs.map((surah) => {
              const progress = surahProgress[surah.number] || 0;
              const englishTranslation = getEnglishTranslationOnly(surah);
              return (
                <div 
                  key={surah.number} 
                  onClick={() => handleSurahClick(surah)}
                  className="glass-ui p-6 md:p-8 rounded-[2rem] cursor-pointer bg-white dark:bg-navy-900 border border-slate-100 dark:border-slate-800 hover:border-gold/40 hover:shadow-2xl transition-all flex flex-col group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 h-1 bg-gold transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] md:text-xs font-black text-slate-400 group-hover:bg-gold group-hover:text-white transition-all shadow-inner">
                      {surah.number}
                    </div>
                    <div className="text-right">
                       <p className="arabic-text text-xl md:text-2xl text-slate-600 dark:text-slate-300 group-hover:text-gold transition-colors leading-none">
                         {surah.name}
                       </p>
                       <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{surah.revelationType}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter leading-none group-hover:text-gold transition-colors">
                      {surah.englishName}
                    </h4>
                    
                    <p className="playfair text-[10px] md:text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed italic">
                      {englishTranslation}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                       <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{surah.numberOfAyahs} Ayahs</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in">
          <div className="sticky top-0 z-30 flex items-center justify-between py-4 bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 md:-mx-6 md:px-6">
            <div className="flex items-center gap-4">
              <button onClick={() => { setSelectedSurah(null); onAudioStateChange(null); setIsAutoPlaying(false); }} className="p-3 bg-slate-50 dark:bg-navy-900 hover:bg-gold hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 transition-all shadow-sm"><ArrowLeftIcon className="w-4 h-4" /></button>
              <div className="min-w-0">
                <h2 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white playfair italic truncate">{selectedSurah.englishName}</h2>
              </div>
            </div>
            <button onClick={() => { if(isAutoPlaying) { onAudioStateChange(null); setIsAutoPlaying(false); } else { setIsAutoPlaying(true); playAyah(ayahs[0].number, ayahs[0].audio!); } }} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg border ${isAutoPlaying ? 'bg-gold text-white border-gold' : 'bg-navy-950 dark:bg-gold text-white dark:text-navy-950'}`}><SpeakerIcon className="w-4 h-4" />{isAutoPlaying ? 'STOP' : 'PLAY ALL'}</button>
          </div>

          <div className="max-w-4xl mx-auto space-y-6 md:space-y-10">
            {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
              <div className="text-center py-10 md:py-16 bg-gold/5 rounded-[3rem] border border-gold/10">
                <p className="arabic-text text-3xl md:text-5xl text-slate-800 dark:text-white">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              </div>
            )}
            {ayahs.map((ayah) => (
                <div id={`ayah-${ayah.number}`} key={ayah.number} className={`relative group p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] transition-all duration-500 border ${activeAudio?.id === `ayah-${ayah.number}` || audioLoading === ayah.number ? 'bg-gold/5 dark:bg-gold/10 border-gold shadow-2xl scale-[1.01]' : 'bg-white dark:bg-navy-900/40 border-slate-50 dark:border-slate-800/50 hover:border-gold/20'}`}>
                  <div className="flex flex-col md:flex-row-reverse items-start gap-8 md:gap-12">
                    <div className="flex md:flex-col items-center gap-4 shrink-0 self-center md:self-start">
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center text-[10px] md:text-xs font-black transition-all ${activeAudio?.id === `ayah-${ayah.number}` || audioLoading === ayah.number ? 'bg-gold border-gold text-navy-950' : 'border-slate-100 text-slate-500'}`}>{ayah.number}</div>
                      <button onClick={() => playAyah(ayah.number, ayah.audio!)} className={`relative flex flex-col items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl transition-all shadow-md ${activeAudio?.id === `ayah-${ayah.number}` || audioLoading === ayah.number ? 'bg-gold text-white scale-110' : 'bg-slate-50 dark:bg-navy-800 text-slate-400 hover:text-gold'}`}>
                        {audioLoading === ayah.number ? (
                          <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <SpeakerIcon className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                        {(activeAudio?.id === `ayah-${ayah.number}` || audioLoading === ayah.number) && (
                          <span className="absolute -bottom-6 text-[7px] font-black uppercase text-gold whitespace-nowrap">
                            {audioLoading === ayah.number ? 'Connecting...' : 'Stop'}
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="flex-1 space-y-4 md:space-y-8 w-full">
                      <p className={`arabic-text text-2xl md:text-5xl lg:text-6xl text-right leading-[1.8] md:leading-[2] transition-colors duration-500 ${activeAudio?.id === `ayah-${ayah.number}` ? 'text-gold' : 'text-slate-800 dark:text-slate-100'}`}>
                        {selectedSurah.number !== 1 && ayah.number === 1 ? ayah.text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '') : ayah.text}
                      </p>
                      <div className="pt-6 md:pt-10 border-t border-slate-50 dark:border-slate-800/50 space-y-4">
                        <p className="text-sm md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">{ayah.translation}</p>
                        <p className="arabic-text text-lg md:text-2xl text-emerald-700 dark:text-emerald-400 font-bold leading-relaxed">{ayah.urduTranslation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <button 
        onClick={scrollToTop} 
        className={`fixed bottom-24 right-6 p-4 bg-gold text-navy-950 rounded-full shadow-2xl transition-all duration-300 z-50 md:hidden ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
      </button>
    </div>
  );
};

export default QuranExplorer;
