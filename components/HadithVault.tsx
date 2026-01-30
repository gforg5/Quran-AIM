
import React, { useState, useEffect, useRef } from 'react';
import { Hadith } from '../types';
import { SearchIcon, BayanLogo, SpeakerIcon, ArrowLeftIcon } from './Icons';
import { speakGuidance, decodeAudio, decodeAudioData } from '../services/geminiService';

const HadithVault: React.FC = () => {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedHadith, setSelectedHadith] = useState<Hadith | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [bookmarkedHadiths, setBookmarkedHadiths] = useState<string[]>([]);
  const [activeCollection, setActiveCollection] = useState('All');
  const audioContextRef = useRef<AudioContext | null>(null);

  const collections = ["All", "Sahih Bukhari", "Sahih Muslim", "Sunan Abi Dawud"];

  const initialHadiths: Hadith[] = [
    {
      id: '1',
      collection: 'Sahih Bukhari',
      hadithNumber: '1',
      narrator: 'Umar bin al-Khattab',
      hadithArabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى...',
      hadithEnglish: 'Actions are but by intentions and every man shall have only that which he intended...',
      text: 'Actions are but by intentions...',
      source: 'Sahih Bukhari'
    },
    {
      id: '2',
      collection: 'Sahih Muslim',
      hadithNumber: '8',
      narrator: 'Abdullah bin Umar',
      hadithArabic: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ...',
      hadithEnglish: 'Islam is built upon five pillars: Testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, performing prayers, paying Zakat, making Hajj to the House, and fasting in Ramadan.',
      text: 'Islam is built upon five...',
      source: 'Sahih Muslim'
    },
    {
      id: '3',
      collection: 'Sahih Bukhari',
      hadithNumber: '2',
      narrator: 'Aisha (RA)',
      hadithArabic: 'أَنَّ الْحَارِثَ بْنَ هِشَامٍ ـ رضى الله عنه ـ سَأَلَ رَسُولَ اللَّهِ صلى الله عليه وسلم فَقَالَ يَا رَسُولَ اللَّهِ كَيْفَ يَأْتِيكَ الْوَحْىُ...',
      hadithEnglish: 'Al-Harith bin Hisham asked the Messenger of Allah, "How does the Divine Inspiration come to you?" The Prophet replied, "Sometimes it comes like the ringing of a bell, and this is the hardest for me..."',
      text: 'The beginning of Revelation...',
      source: 'Sahih Bukhari'
    },
    {
      id: '4',
      collection: 'Sunan Abi Dawud',
      hadithNumber: '4833',
      narrator: 'Abu Hurairah',
      hadithArabic: 'الْمَرْءُ عَلَى دِينِ خَلِيلِهِ فَلْيَنْظُرْ أَحَدُكُمْ مَنْ يُخَالِلُ',
      hadithEnglish: 'A man follows the religion of his friend; so each one of you should consider whom he makes his friend.',
      text: 'Importance of good company.',
      source: 'Sunan Abi Dawud'
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('almalik_hadith_bookmarks');
    if (saved) setBookmarkedHadiths(JSON.parse(saved));
    
    // Simulate API fetch delay
    setTimeout(() => {
      setHadiths(initialHadiths);
      setLoading(false);
    }, 600);
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let newBookmarks = [...bookmarkedHadiths];
    if (newBookmarks.includes(id)) {
      newBookmarks = newBookmarks.filter(b => b !== id);
    } else {
      newBookmarks.push(id);
    }
    setBookmarkedHadiths(newBookmarks);
    localStorage.setItem('almalik_hadith_bookmarks', JSON.stringify(newBookmarks));
  };

  const handleVoiceInsight = async (h: Hadith, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSpeaking === h.id) return;
    setIsSpeaking(h.id);
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
      const base64 = await speakGuidance(`Narrated by ${h.narrator}: ${h.hadithEnglish || h.text}. Source: ${h.collection}.`);
      const audioBytes = decodeAudio(base64);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(null);
      source.start();
    } catch (err) {
      console.error(err);
      setIsSpeaking(null);
    }
  };

  const filteredHadiths = hadiths.filter(h => {
    const matchesSearch = h.hadithEnglish?.toLowerCase().includes(search.toLowerCase()) || 
                          h.narrator.toLowerCase().includes(search.toLowerCase()) ||
                          h.hadithNumber.includes(search);
    const matchesCollection = activeCollection === 'All' || h.collection === activeCollection;
    return matchesSearch && matchesCollection;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-6 opacity-30">
        <BayanLogo className="w-16 h-16 animate-pulse text-gold" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Retrieving Traditions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-2 sm:px-4">
      {!selectedHadith ? (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-3">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white playfair italic">PROPHETIC VAULT</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-base font-bold uppercase tracking-widest">Explore authenticated traditions and wisdom</p>
            </div>
            <div className="relative w-full md:w-96 group">
              <input 
                type="text" 
                placeholder="Search Hadith, Narrator, No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-navy-900 border-2 border-slate-100 dark:border-slate-800 rounded-full py-4 pl-12 pr-6 text-sm font-bold focus:border-gold outline-none transition-all shadow-sm"
              />
              <SearchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-gold transition-colors" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {collections.map(col => (
              <button 
                key={col}
                onClick={() => setActiveCollection(col)}
                className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeCollection === col ? 'bg-gold text-white' : 'bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-gold'}`}
              >
                {col}
              </button>
            ))}
          </div>

          <div className="grid gap-6">
            {filteredHadiths.map((h) => (
              <div 
                key={h.id} 
                onClick={() => setSelectedHadith(h)}
                className="group glass-ui bg-white dark:bg-navy-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-gold/30 transition-all cursor-pointer hover:shadow-2xl relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-[8px] font-black uppercase tracking-widest">{h.collection}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">#{h.hadithNumber}</span>
                      </div>
                      <button 
                        onClick={(e) => toggleBookmark(h.id, e)}
                        className={`p-2 rounded-lg transition-colors ${bookmarkedHadiths.includes(h.id) ? 'text-gold' : 'text-slate-300 hover:text-gold'}`}
                      >
                        <svg className="w-4 h-4" fill={bookmarkedHadiths.includes(h.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-lg md:text-2xl font-black text-slate-800 dark:text-slate-100 leading-relaxed italic line-clamp-3">
                      "{h.hadithEnglish || h.text}"
                    </p>
                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800/30">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Narrated by {h.narrator}</p>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col justify-end items-center gap-4">
                     <button 
                       onClick={(e) => handleVoiceInsight(h, e)}
                       className={`p-5 rounded-2xl transition-all shadow-lg ${isSpeaking === h.id ? 'bg-gold text-white scale-110' : 'bg-slate-50 dark:bg-navy-800 text-slate-400 dark:text-slate-500 hover:text-gold'}`}
                     >
                       {isSpeaking === h.id ? (
                          <div className="flex gap-1 items-end h-5">
                            <div className="w-1 h-2 bg-white animate-pulse"></div>
                            <div className="w-1 h-4 bg-white animate-pulse delay-75"></div>
                            <div className="w-1 h-3 bg-white animate-pulse delay-150"></div>
                          </div>
                       ) : (
                          <SpeakerIcon className="w-5 h-5" />
                       )}
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-right">
           <div className="flex items-center gap-4 pb-8 border-b border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setSelectedHadith(null)}
                className="p-3 bg-slate-50 dark:bg-navy-900 hover:bg-gold hover:text-white rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 transition-all shadow-sm"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white playfair italic">Detailed Insight</h3>
                <span className="text-[8px] font-black text-gold uppercase tracking-[0.4em]">{selectedHadith.collection} • #{selectedHadith.hadithNumber}</span>
              </div>
           </div>

           <div className="glass-ui rounded-[3rem] p-8 md:p-16 border border-slate-100 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-2xl space-y-12">
               <div className="space-y-4">
                  <span className="text-[8px] font-black text-gold uppercase tracking-widest block text-center opacity-40">ARABIC TEXT</span>
                  <p className="arabic-text text-2xl md:text-5xl text-slate-800 dark:text-white leading-relaxed text-right">
                    {selectedHadith.hadithArabic}
                  </p>
               </div>

               <div className="pt-10 border-t border-slate-50 dark:border-slate-800/50 space-y-8">
                 <div className="p-8 md:p-10 bg-slate-50/50 dark:bg-navy-800/30 rounded-[2rem] border-l-8 border-gold italic shadow-inner">
                   <p className="text-lg md:text-3xl text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                     "{selectedHadith.hadithEnglish || selectedHadith.text}"
                   </p>
                 </div>
                 
                 <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Narrated by</p>
                       <p className="text-xl md:text-3xl font-black text-gold italic">{selectedHadith.narrator}</p>
                    </div>
                    <button 
                      onClick={() => handleVoiceInsight(selectedHadith)}
                      className={`w-full md:w-auto px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-4 border ${isSpeaking === selectedHadith.id ? 'bg-gold text-white border-gold' : 'bg-navy-950 dark:bg-gold text-white dark:text-navy-950 border-transparent'}`}
                    >
                      <SpeakerIcon className="w-5 h-5" />
                      {isSpeaking === selectedHadith.id ? 'STREAMING...' : 'READ ALOUD'}
                    </button>
                 </div>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HadithVault;
