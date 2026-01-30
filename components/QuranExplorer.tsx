
import React, { useState, useEffect, useRef } from 'react';
import { Surah, Ayah } from '../types';
import { SearchIcon, ArrowLeftIcon, BayanLogo, SpeakerIcon } from './Icons';

const QuranExplorer: React.FC = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [bookmarks, setBookmarks] = useState<Record<number, number>>({}); // Surah Number -> Ayah Number mapping
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSurahs();
    const saved = localStorage.getItem('almalik_bookmarks');
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  const fetchSurahs = async () => {
    try {
      const res = await fetch('https://api.alquran.cloud/v1/surah');
      const data = await res.json();
      setSurahs(data.data);
    } catch (err) {
      console.error("Sync Error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAyahs = async (surahNumber: number) => {
    setLoading(true);
    setPlayingAyah(null);
    setIsAutoPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,ar.alafasy`);
      const data = await res.json();
      const combined = data.data[0].ayahs.map((a: any, i: number) => ({
        number: a.numberInSurah,
        text: a.text,
        translation: data.data[1].ayahs[i].text,
        audio: data.data[2].ayahs[i].audio
      }));
      setAyahs(combined);
    } catch (err) {
      console.error("Fetch Error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSurahClick = (surah: Surah) => {
    setSelectedSurah(surah);
    fetchAyahs(surah.number);
  };

  const toggleBookmark = (surahNum: number, ayahNum: number) => {
    const newBookmarks = { ...bookmarks };
    if (newBookmarks[surahNum] === ayahNum) {
      delete newBookmarks[surahNum];
    } else {
      newBookmarks[surahNum] = ayahNum;
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('almalik_bookmarks', JSON.stringify(newBookmarks));
  };

  const scrollToMark = () => {
    if (selectedSurah && bookmarks[selectedSurah.number]) {
      const element = document.getElementById(`ayah-${bookmarks[selectedSurah.number]}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    if (isAutoPlaying && playingAyah !== null && playingAyah < ayahs.length) {
      const nextAyah = ayahs[playingAyah]; // index is numberInSurah which is 1-based usually
      playAyah(nextAyah.number, nextAyah.audio!);
    } else {
      setPlayingAyah(null);
      setIsAutoPlaying(false);
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
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Connecting to Holy Word...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
      <audio ref={audioRef} onEnded={handleAudioEnd} className="hidden" />
      
      {!selectedSurah ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">The Holy Quran</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-base font-medium">Read and listen to the 114 Surahs with clear translations.</p>
            </div>
            <div className="relative w-full md:w-96 group">
              <input 
                type="text" 
                placeholder="Find a Surah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-navy-900 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-gold outline-none transition-all shadow-inner"
              />
              <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-gold transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSurahs.map((surah) => (
              <div 
                key={surah.number} 
                onClick={() => handleSurahClick(surah)}
                className={`p-5 rounded-2xl cursor-pointer bg-white dark:bg-navy-900 border transition-all grid grid-cols-[36px_1fr_auto] items-center group gap-3 relative overflow-hidden ${bookmarks[surah.number] ? 'border-gold/50 shadow-gold/5' : 'border-slate-100 dark:border-slate-800 hover:border-gold/40'}`}
              >
                {bookmarks[surah.number] && (
                  <div className="absolute top-0 right-0 p-1 bg-gold rounded-bl-xl shadow-lg z-10 animate-pulse">
                    <svg className="w-2.5 h-2.5 text-navy-950" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4c0-1.1.9-2 2-2h10a2 2 0 012 2v18l-7-3-7 3V4z"/></svg>
                  </div>
                )}
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-gold group-hover:text-white transition-all">
                  {surah.number}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-100 truncate">{surah.englishName}</h4>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    {surah.numberOfAyahs} Ayahs {bookmarks[surah.number] && `• Mark at ${bookmarks[surah.number]}`}
                  </p>
                </div>
                <p className="arabic-text text-xl text-slate-600 dark:text-slate-300 group-hover:text-gold transition-colors">{surah.name}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-8 pb-20 relative">
          <div className="sticky top-0 z-30 flex items-center justify-between py-4 bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 -mx-4 px-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedSurah(null)}
                className="p-3 bg-slate-50 dark:bg-navy-900 hover:bg-gold hover:text-white rounded-xl text-slate-500 dark:text-slate-400 transition-all shadow-sm"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedSurah.englishName}</h2>
                <span className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em]">{selectedSurah.revelationType} • Surah {selectedSurah.number}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {bookmarks[selectedSurah.number] && (
                <button onClick={scrollToMark} className="p-3 bg-gold/10 text-gold rounded-xl hover:bg-gold/20 transition-all flex items-center gap-2 border border-gold/20">
                  <span className="text-[8px] font-black uppercase">Jump to Mark ({bookmarks[selectedSurah.number]})</span>
                </button>
              )}
              <button onClick={() => { setIsAutoPlaying(!isAutoPlaying); if(!isAutoPlaying) playAyah(ayahs[0].number, ayahs[0].audio!); }} className={`p-3 rounded-xl text-[8px] font-black uppercase transition-all shadow-lg ${isAutoPlaying ? 'bg-gold text-white' : 'bg-navy-900 text-white hover:bg-gold'}`}>
                {isAutoPlaying ? 'Reciting...' : 'Play Audio'}
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
              <div className="text-center py-10 bg-gold/5 rounded-[2.5rem] border border-gold/10 mx-2">
                <p className="arabic-text text-3xl md:text-5xl text-slate-800 dark:text-white">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              </div>
            )}
            
            <div className="space-y-6 px-2">
              {ayahs.map((ayah) => (
                <div 
                  id={`ayah-${ayah.number}`}
                  key={ayah.number} 
                  className={`p-6 md:p-10 rounded-[2rem] border transition-all duration-500 relative group ${
                    playingAyah === ayah.number 
                      ? 'bg-gold/5 dark:bg-gold/10 border-gold shadow-xl' 
                      : bookmarks[selectedSurah.number] === ayah.number 
                        ? 'bg-gold/5 border-gold/30'
                        : 'bg-white dark:bg-navy-900/40 border-slate-50 dark:border-slate-800/50 hover:border-gold/20'
                  }`}
                >
                  <div className="flex flex-col md:flex-row-reverse items-start gap-6">
                    <div className="flex flex-row md:flex-col items-center gap-3 shrink-0 self-end md:self-start">
                      <div className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                        {ayah.number}
                      </div>
                      <button 
                        onClick={() => toggleBookmark(selectedSurah.number, ayah.number)} 
                        title="Mark Verse"
                        className={`p-2 rounded-lg transition-all active:scale-90 ${bookmarks[selectedSurah.number] === ayah.number ? 'bg-gold text-white' : 'text-slate-300 hover:text-gold hover:bg-gold/5'}`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4c0-1.1.9-2 2-2h10a2 2 0 012 2v18l-7-3-7 3V4z"/></svg>
                      </button>
                      <button onClick={() => toggleAudio(ayah.number, ayah.audio!)} className={`p-3 rounded-xl transition-all active:scale-95 ${playingAyah === ayah.number ? 'bg-gold text-white scale-110 shadow-lg' : 'bg-slate-50 dark:bg-navy-800 text-slate-400 hover:text-gold'}`}>
                        <SpeakerIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-6 w-full text-right">
                      <p className={`arabic-text text-2xl md:text-5xl leading-relaxed transition-colors duration-500 ${playingAyah === ayah.number ? 'text-gold' : 'text-slate-800 dark:text-slate-100'}`}>
                        {ayah.text}
                      </p>
                      <div className="pt-6 border-t border-slate-50 dark:border-slate-800/50 text-left">
                        <p className="text-sm md:text-xl text-slate-600 dark:text-slate-400 font-medium italic leading-relaxed">
                          {ayah.translation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center pt-10">
             <button onClick={() => { setSelectedSurah(null); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="px-12 py-5 bg-slate-100 dark:bg-navy-900 text-slate-500 font-black uppercase tracking-widest text-[9px] rounded-2xl hover:bg-gold hover:text-white transition-all shadow-xl active:scale-95">
                Close Surah
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranExplorer;
