
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
  const [bookmarks, setBookmarks] = useState<Record<number, number>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // handleSurahClick handles the user selecting a surah to read/listen to
  const handleSurahClick = (surah: Surah) => {
    setSelectedSurah(surah);
    fetchAyahs(surah.number);
  };

  const toggleBookmark = (surahNum: number, ayahNum: number) => {
    const newBookmarks = { ...bookmarks };
    if (newBookmarks[surahNum] === ayahNum) delete newBookmarks[surahNum];
    else newBookmarks[surahNum] = ayahNum;
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
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAyah(ayahNumber);
      }
    }
  };

  const handleAudioEnd = () => {
    if (isAutoPlaying && playingAyah !== null && playingAyah < ayahs.length) {
      const nextAyah = ayahs[playingAyah];
      toggleAudio(nextAyah.number, nextAyah.audio!);
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
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4 opacity-40">
        <BayanLogo className="w-12 h-12 animate-spin-slow text-gold" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Quran...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-in fade-in">
      <audio ref={audioRef} onEnded={handleAudioEnd} className="hidden" />
      
      {!selectedSurah ? (
        <>
          <div className="flex flex-col gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="px-1">
              <h2 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">The Holy Quran</h2>
              <p className="text-slate-400 text-[10px] md:text-base font-medium">Read the 114 Surahs with translations.</p>
            </div>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Find a Surah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100 dark:bg-navy-900 border-none rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none transition-all shadow-inner"
              />
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
            {filteredSurahs.map((surah) => (
              <div 
                key={surah.number} 
                onClick={() => handleSurahClick(surah)}
                className={`p-3 md:p-5 rounded-xl cursor-pointer bg-white dark:bg-navy-900 border transition-all grid grid-cols-[30px_1fr_auto] items-center group gap-2 relative overflow-hidden active:scale-95 ${bookmarks[surah.number] ? 'border-gold shadow-sm' : 'border-slate-100 dark:border-slate-800'}`}
              >
                {bookmarks[surah.number] && (
                  <div className="absolute top-0 right-0 p-1 bg-gold rounded-bl-lg shadow-sm z-10">
                    <svg className="w-2 h-2 text-navy-950" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4c0-1.1.9-2 2-2h10a2 2 0 012 2v18l-7-3-7 3V4z"/></svg>
                  </div>
                )}
                <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-400 group-hover:bg-gold group-hover:text-white transition-all">
                  {surah.number}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] md:text-sm font-black text-slate-800 dark:text-slate-100 truncate">{surah.englishName}</h4>
                  <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{surah.numberOfAyahs} Ayahs</p>
                </div>
                <p className="arabic-text text-sm md:text-xl text-slate-500 dark:text-slate-300 group-hover:text-gold transition-colors">{surah.name}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6 pb-12 relative animate-in slide-in-from-right">
          <div className="sticky top-0 z-30 flex items-center justify-between py-2 bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 -mx-3 px-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedSurah(null)} className="p-2 bg-slate-100 dark:bg-navy-900 rounded-lg text-slate-500"><ArrowLeftIcon className="w-4 h-4" /></button>
              <div>
                <h2 className="text-sm md:text-xl font-black text-slate-900 dark:text-white truncate max-w-[120px]">{selectedSurah.englishName}</h2>
                <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">{selectedSurah.numberOfAyahs} Ayahs</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {bookmarks[selectedSurah.number] && (
                <button onClick={scrollToMark} className="px-2 py-1.5 bg-gold/10 text-gold rounded-lg text-[7px] font-black uppercase border border-gold/20">Go to Mark</button>
              )}
              <button onClick={() => { setIsAutoPlaying(!isAutoPlaying); if(!isAutoPlaying) toggleAudio(ayahs[0].number, ayahs[0].audio!); }} className={`px-2 py-1.5 rounded-lg text-[7px] font-black uppercase shadow-sm transition-all ${isAutoPlaying ? 'bg-gold text-white' : 'bg-navy-900 text-white'}`}>
                {isAutoPlaying ? 'Reciting...' : 'Play'}
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
              <div className="text-center py-6 bg-gold/5 rounded-[2rem] border border-gold/10">
                <p className="arabic-text text-xl md:text-4xl text-slate-800 dark:text-white">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              </div>
            )}
            
            <div className="space-y-3 px-1">
              {ayahs.map((ayah) => (
                <div 
                  id={`ayah-${ayah.number}`}
                  key={ayah.number} 
                  className={`p-4 md:p-8 rounded-2xl border transition-all duration-300 relative group ${
                    playingAyah === ayah.number ? 'bg-gold/5 border-gold shadow-md' : bookmarks[selectedSurah.number] === ayah.number ? 'bg-gold/5 border-gold/30' : 'bg-white dark:bg-navy-900/40 border-slate-100 dark:border-slate-800/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row-reverse items-start gap-4">
                    <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 self-end md:self-start">
                      <div className="w-8 h-8 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[9px] font-black text-slate-400">
                        {ayah.number}
                      </div>
                      <button onClick={() => toggleBookmark(selectedSurah.number, ayah.number)} className={`p-1.5 rounded-md transition-all ${bookmarks[selectedSurah.number] === ayah.number ? 'text-gold' : 'text-slate-300 hover:text-gold'}`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 4c0-1.1.9-2 2-2h10a2 2 0 012 2v18l-7-3-7 3V4z"/></svg>
                      </button>
                      <button onClick={() => toggleAudio(ayah.number, ayah.audio!)} className={`p-2 rounded-lg transition-all ${playingAyah === ayah.number ? 'bg-gold text-white' : 'bg-slate-50 dark:bg-navy-800 text-slate-400'}`}>
                        <SpeakerIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-4 w-full text-right">
                      <p className={`arabic-text text-xl md:text-4xl leading-relaxed transition-colors duration-300 ${playingAyah === ayah.number ? 'text-gold' : 'text-slate-800 dark:text-slate-100'}`}>
                        {ayah.text}
                      </p>
                      <div className="pt-3 border-t border-slate-50 dark:border-slate-800/50 text-left">
                        <p className="text-[10px] md:text-lg text-slate-600 dark:text-slate-400 font-medium italic leading-relaxed">
                          {ayah.translation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranExplorer;
