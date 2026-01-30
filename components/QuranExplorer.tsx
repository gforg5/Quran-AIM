
import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah, Bookmark } from '../types';
import { SearchIcon, ArrowLeftIcon, BayanLogo, SpeakerIcon } from './Icons';

const QuranExplorer: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchSurahs();
    loadBookmarks();
  }, []);

  const loadBookmarks = () => {
    const saved = localStorage.getItem('almalik_bookmarks');
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  };

  const toggleBookmark = (ayahNumber: number) => {
    if (!selectedSurah) return;
    const existingIndex = bookmarks.findIndex(b => b.surahNumber === selectedSurah.number && b.ayahNumber === ayahNumber);
    let newBookmarks = [...bookmarks];
    
    if (existingIndex > -1) {
      newBookmarks.splice(existingIndex, 1);
    } else {
      newBookmarks.push({
        surahNumber: selectedSurah.number,
        surahName: selectedSurah.englishName,
        ayahNumber: ayahNumber,
        timestamp: Date.now()
      });
    }
    
    setBookmarks(newBookmarks);
    localStorage.setItem('almalik_bookmarks', JSON.stringify(newBookmarks));
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
    setPlayingAyah(null);
    setIsAutoPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,ar.alafasy`);
      const data = await res.json();
      const arabic = data.data[0].ayahs;
      const translation = data.data[1].ayahs;
      const audio = data.data[2].ayahs;
      
      const combined = arabic.map((a: any, i: number) => ({
        number: a.numberInSurah,
        text: a.text,
        translation: translation[i].text,
        audio: audio[i].audio
      }));
      
      setAyahs(combined);
      
      if (targetAyah) {
        setTimeout(() => {
          const element = document.getElementById(`ayah-${targetAyah}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1000);
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
  };

  const handleBookmarkJump = (bookmark: Bookmark) => {
    const surah = surahs.find(s => s.number === bookmark.surahNumber);
    if (surah) {
      setSelectedSurah(surah);
      fetchAyahs(surah.number, bookmark.ayahNumber);
    }
  };

  const toggleAudio = (ayahNumber: number, audioUrl: string) => {
    if (playingAyah === ayahNumber) {
      audioRef.current?.pause();
      setPlayingAyah(null);
      setIsAutoPlaying(false);
    } else {
      playAyah(ayahNumber, audioUrl);
    }
  };

  const playAyah = (ayahNumber: number, audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setPlayingAyah(ayahNumber);
      
      const element = document.getElementById(`ayah-${ayahNumber}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAudioEnd = () => {
    if (isAutoPlaying && playingAyah !== null) {
      const nextIndex = playingAyah;
      if (nextIndex < ayahs.length) {
        const nextAyah = ayahs[nextIndex];
        playAyah(nextAyah.number, nextAyah.audio!);
      } else {
        setIsAutoPlaying(false);
        setPlayingAyah(null);
      }
    } else {
      setPlayingAyah(null);
    }
  };

  const startSurahVoice = () => {
    if (ayahs.length > 0) {
      setIsAutoPlaying(true);
      playAyah(ayahs[0].number, ayahs[0].audio!);
    }
  };

  const filteredSurahs = surahs.filter(s => 
    s.englishName.toLowerCase().includes(search.toLowerCase()) || 
    s.number.toString().includes(search)
  );

  if (loading && surahs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-6 opacity-40">
        <BayanLogo className="w-16 h-16 animate-spin-slow text-gold" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      <audio ref={audioRef} onEnded={handleAudioEnd} className="hidden" />
      
      {!selectedSurah ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-slate-200 dark:border-slate-800 px-2">
            <div className="space-y-2 md:space-y-4">
              <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white playfair italic">The Holy Quran</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-base font-medium max-w-md">read and listen 114 surah with translation</p>
            </div>
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-0 bg-gold/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              <input 
                type="text" 
                placeholder="Search surah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-navy-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] py-4 md:py-5 pl-12 md:pl-14 pr-6 text-sm font-bold focus:border-gold focus:ring-0 outline-none transition-all shadow-sm group-hover:shadow-md relative z-10 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <SearchIcon className="w-5 h-5 md:w-6 md:h-6 absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-gold transition-colors z-20" />
            </div>
          </div>

          {bookmarks.length > 0 && (
            <div className="px-2 space-y-4">
               <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Your Marks</h3>
               <div className="flex flex-wrap gap-3">
                  {bookmarks.map((b, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleBookmarkJump(b)}
                      className="px-6 py-3 bg-white dark:bg-navy-900 border border-gold/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-gold hover:text-white transition-all shadow-sm"
                    >
                      {b.surahName} : {b.ayahNumber}
                    </button>
                  ))}
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-2">
            {filteredSurahs.map((surah) => (
              <div 
                key={surah.number} 
                onClick={() => handleSurahClick(surah)}
                className="glass-ui p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] cursor-pointer bg-white dark:bg-navy-900 border border-slate-100 dark:border-slate-800 hover:border-gold/40 hover:shadow-2xl transition-all grid grid-cols-[40px_1fr_auto] items-center group gap-3 overflow-hidden min-h-[80px]"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] md:text-xs font-black text-slate-400 group-hover:bg-gold group-hover:text-white transition-all shadow-inner">
                  {surah.number}
                </div>
                
                <div className="min-w-0 flex flex-col justify-center">
                  <h4 className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-100 truncate pr-1">
                    {surah.englishName}
                  </h4>
                  <p className="text-[7px] md:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.05em] truncate">
                    {surah.englishNameTranslation}
                  </p>
                </div>

                <div className="text-right shrink-0 overflow-hidden">
                  <p className="arabic-text text-xl md:text-2xl text-slate-600 dark:text-slate-300 group-hover:text-gold transition-colors leading-none whitespace-nowrap">
                    {surah.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-8 pb-20">
          <div className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 py-4 md:py-6 bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 md:-mx-6 md:px-6">
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={() => setSelectedSurah(null)}
                className="p-3 md:p-4 bg-slate-50 dark:bg-navy-900 hover:bg-gold hover:text-white rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 transition-all shadow-sm"
              >
                <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <div className="min-w-0">
                <h2 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white playfair italic truncate max-w-[150px] md:max-w-none">{selectedSurah.englishName}</h2>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-slate-400 dark:text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em]">{selectedSurah.revelationType}</span>
                  <div className="w-1 h-1 bg-gold rounded-full"></div>
                  <span className="text-slate-400 dark:text-slate-500 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em]">{selectedSurah.numberOfAyahs} Ayahs</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={startSurahVoice}
                disabled={isAutoPlaying}
                className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg border ${isAutoPlaying ? 'bg-gold text-white border-gold' : 'bg-navy-950 dark:bg-gold text-white dark:text-navy-950 border-transparent hover:scale-105'}`}
              >
                <SpeakerIcon className="w-4 h-4" />
                {isAutoPlaying ? 'Listening...' : 'Play Surah'}
              </button>
            </div>
          </div>

          <div className="reading-mode-active space-y-12 max-w-4xl mx-auto">
            {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
              <div className="text-center py-12 md:py-16 bg-gold/5 rounded-[2.5rem] md:rounded-[4rem] border border-gold/10 mx-2">
                <p className="arabic-text text-3xl md:text-5xl text-slate-800 dark:text-white text-glow">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              </div>
            )}
            
            <div className="space-y-6 md:space-y-8 px-2">
              {ayahs.map((ayah) => {
                const isMarked = bookmarks.some(b => b.surahNumber === selectedSurah?.number && b.ayahNumber === ayah.number);
                return (
                  <div 
                    id={`ayah-${ayah.number}`}
                    key={ayah.number} 
                    className={`relative group p-6 md:p-10 lg:p-14 rounded-[2rem] md:rounded-[3.5rem] transition-all duration-700 border ${
                      playingAyah === ayah.number 
                        ? 'bg-gold/5 dark:bg-gold/10 border-gold shadow-2xl scale-[1.01]' 
                        : 'bg-white dark:bg-navy-900/40 border-slate-50 dark:border-slate-800/50 hover:border-gold/20'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row-reverse items-start gap-6 md:gap-12">
                      <div className="flex flex-row md:flex-col items-center gap-4 shrink-0 self-center md:self-start">
                        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center text-[10px] md:text-xs font-black transition-all shadow-sm ${isMarked ? 'bg-gold border-gold text-navy-950' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                          {ayah.number}
                        </div>
                        <button 
                          onClick={() => toggleBookmark(ayah.number)}
                          className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all shadow-md ${isMarked ? 'bg-gold text-white' : 'bg-slate-50 dark:bg-navy-800 text-slate-400 dark:text-slate-500 hover:text-gold hover:bg-gold/10'}`}
                          title="Bookmark this Ayah"
                        >
                          <svg className="w-4 h-4 md:w-6 md:h-6" fill={isMarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        {ayah.audio && (
                          <button 
                            onClick={() => toggleAudio(ayah.number, ayah.audio!)}
                            className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all shadow-md ${playingAyah === ayah.number ? 'bg-gold text-white scale-110' : 'bg-slate-50 dark:bg-navy-800 text-slate-400 dark:text-slate-500 hover:text-gold hover:bg-gold/10'}`}
                          >
                            {playingAyah === ayah.number ? (
                              <div className="flex items-center gap-1">
                                 <div className="w-0.5 h-3 md:h-4 bg-white animate-pulse"></div>
                                 <div className="w-0.5 h-5 md:h-6 bg-white animate-pulse delay-75"></div>
                                 <div className="w-0.5 h-3 md:h-4 bg-white animate-pulse delay-150"></div>
                              </div>
                            ) : (
                              <SpeakerIcon className="w-4 h-4 md:w-6 md:h-6" />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex-1 space-y-6 md:space-y-10 w-full min-w-0">
                        <p className={`arabic-text text-2xl md:text-5xl lg:text-7xl text-right leading-[1.8] md:leading-[2] transition-colors duration-700 break-words ${playingAyah === ayah.number ? 'text-gold' : 'text-slate-800 dark:text-slate-100'}`}>
                          {selectedSurah.number !== 1 && ayah.number === 1 ? ayah.text.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '') : ayah.text}
                        </p>
                        
                        <div className="pt-6 md:pt-10 border-t border-slate-50 dark:border-slate-800/50">
                          <p className="text-sm md:text-xl lg:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-4xl italic">
                            {ayah.translation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-center pt-16">
             <button 
                onClick={() => { setSelectedSurah(null); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                className="px-10 md:px-14 py-4 md:py-5 bg-slate-100 dark:bg-navy-900 text-slate-500 font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] rounded-[2rem] hover:bg-gold hover:text-white transition-all shadow-xl"
             >
                Close Surah
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranExplorer;
