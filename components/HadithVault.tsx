
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
  const audioContextRef = useRef<AudioContext | null>(null);

  const initialHadiths: Hadith[] = [
    {
      id: '1',
      collection: 'Sahih Bukhari',
      bookNumber: '1',
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
      bookNumber: '1',
      hadithNumber: '8',
      narrator: 'Abdullah bin Umar',
      hadithArabic: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ...',
      hadithEnglish: 'Islam is built upon five...',
      text: 'Islam is built upon five...',
      source: 'Sahih Muslim'
    },
    {
      id: '3',
      collection: 'Sahih Bukhari',
      bookNumber: '1',
      hadithNumber: '2',
      narrator: 'Aisha (RA)',
      hadithArabic: 'أَنَّ الْحَارِثَ بْنَ هِشَامٍ ـ رضى الله عنه ـ سَأَلَ رَسُولَ اللَّهِ صلى الله عليه وسلم فَقَالَ يَا رَسُولَ اللَّهِ كَيْفَ يَأْتِيكَ الْوَحْىُ...',
      hadithEnglish: 'Al-Harith bin Hisham asked the Messenger of Allah, "How does the Divine Inspiration come to you?"',
      text: 'The beginning of Revelation...',
      source: 'Sahih Bukhari'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setHadiths(initialHadiths);
      setLoading(false);
    }, 800);
  }, []);

  const handleVoiceInsight = async (h: Hadith) => {
    if (isSpeaking === h.id) return;
    setIsSpeaking(h.id);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const base64 = await speakGuidance(`Narrated by ${h.narrator}: ${h.hadithEnglish || h.text}. This is from ${h.collection}.`);
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

  const filteredHadiths = hadiths.filter(h => 
    h.text.toLowerCase().includes(search.toLowerCase()) || 
    h.narrator.toLowerCase().includes(search.toLowerCase()) ||
    h.hadithEnglish?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 opacity-30">
        <BayanLogo className="w-20 h-20 animate-pulse text-gold" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Unlocking The Traditions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 px-2 lg:px-0 pb-20">
      {!selectedHadith ? (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white playfair italic">Prophetic Wisdom</h2>
              <p className="text-slate-500 dark:text-slate-400 text-base font-medium max-w-md">The authenticated vault of the Messenger's (PBUH) traditions.</p>
            </div>
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-0 bg-gold/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <input 
                type="text" 
                placeholder="Search the Traditions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-navy-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] py-5 pl-14 pr-6 text-sm font-bold focus:border-gold outline-none transition-all shadow-sm group-hover:shadow-md relative z-10 placeholder:text-slate-400"
              />
              <SearchIcon className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-gold transition-colors z-20" />
            </div>
          </div>

          <div className="grid gap-6 md:gap-10">
            {filteredHadiths.map((hadith) => (
              <div 
                key={hadith.id} 
                onClick={() => setSelectedHadith(hadith)}
                className="group glass-ui bg-white dark:bg-navy-900 p-8 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 dark:border-slate-800 hover:border-gold/30 transition-all cursor-pointer hover:shadow-2xl relative overflow-hidden"
              >
                {/* Background Logo - Hidden on Mobile to avoid overlap */}
                <div className="hidden md:block absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BayanLogo className="w-24 h-24" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-10 relative z-10">
                  <div className="space-y-6 md:space-y-8 flex-1">
                    <div className="flex items-center gap-4">
                       <span className="px-4 py-1.5 md:px-5 md:py-2 bg-gold/10 text-gold rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-gold/10">{hadith.collection}</span>
                       <div className="w-1.5 h-1.5 bg-gold/30 rounded-full"></div>
                       <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hadith No. {hadith.hadithNumber}</span>
                    </div>
                    <p className="text-xl lg:text-3xl font-black text-slate-800 dark:text-slate-100 leading-[1.6] italic line-clamp-4 md:line-clamp-none">
                      "{hadith.hadithEnglish || hadith.text}"
                    </p>
                    <div className="pt-4 md:pt-6 border-t border-slate-50 dark:border-slate-800/30">
                       <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Narrated by {hadith.narrator}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Fixed Responsiveness to avoid overlap */}
                  <div className="flex flex-row md:flex-col justify-between md:justify-end items-center gap-4 md:gap-6 pt-4 md:pt-0">
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleVoiceInsight(hadith); }}
                       className={`p-4 md:p-6 rounded-2xl md:rounded-3xl transition-all shadow-xl ${isSpeaking === hadith.id ? 'bg-gold text-white scale-110' : 'bg-slate-50 dark:bg-navy-800 text-slate-400 dark:text-slate-500 hover:text-gold hover:bg-gold/10'}`}
                     >
                       {isSpeaking === hadith.id ? (
                          <div className="flex gap-1 items-end h-4 md:h-6">
                            <div className="w-1 h-2 md:h-3 bg-white animate-pulse"></div>
                            <div className="w-1 h-4 md:h-5 bg-white animate-pulse delay-75"></div>
                            <div className="w-1 h-3 md:h-4 bg-white animate-pulse delay-150"></div>
                          </div>
                       ) : (
                          <SpeakerIcon className="w-5 h-5 md:w-7 md:h-7" />
                       )}
                     </button>
                     <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white group-hover:border-gold transition-all shadow-sm">
                        <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-right duration-500 pb-20">
           <div className="flex items-center gap-4 md:gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setSelectedHadith(null)}
                className="p-4 md:p-5 bg-slate-50 dark:bg-navy-900 hover:bg-gold hover:text-white rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 transition-all shadow-md"
              >
                <ArrowLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="min-w-0">
                <h3 className="text-2xl md:text-4xl font-black tracking-tighter text-slate-900 dark:text-white playfair italic truncate">Traditional Insight</h3>
                <div className="flex items-center gap-3">
                  <p className="text-[8px] md:text-[10px] font-black text-gold uppercase tracking-[0.4em]">{selectedHadith.collection}</p>
                  <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry #{selectedHadith.hadithNumber}</p>
                </div>
              </div>
           </div>

           <div className="glass-ui rounded-[3rem] md:rounded-[4rem] overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)]">
            <div className="p-8 md:p-12 lg:p-24 space-y-12 md:space-y-20">
               <div className="space-y-6 md:space-y-8">
                  <span className="text-[8px] md:text-[10px] font-black text-gold uppercase tracking-[0.5em] block text-center opacity-40">Original Arabic</span>
                  <p className="arabic-text text-2xl md:text-4xl lg:text-7xl text-slate-800 dark:text-white leading-[2] md:leading-[2.4] text-right text-glow drop-shadow-xl overflow-x-auto">
                    {selectedHadith.hadithArabic}
                  </p>
               </div>

               <div className="pt-10 md:pt-20 border-t border-slate-50 dark:border-slate-800/50 space-y-10 md:space-y-14">
                 <div className="p-8 md:p-12 bg-slate-50/50 dark:bg-navy-800/30 rounded-[2.5rem] md:rounded-[4rem] border-l-[8px] md:border-l-[12px] border-gold italic shadow-inner relative overflow-hidden">
                   <div className="hidden md:block absolute top-0 right-0 p-10 opacity-5">
                      <BayanLogo className="w-32 h-32 text-gold" />
                   </div>
                   <p className="text-lg md:text-2xl lg:text-4xl text-slate-700 dark:text-slate-300 font-medium leading-relaxed relative z-10">
                     "{selectedHadith.hadithEnglish || selectedHadith.text}"
                   </p>
                 </div>
                 
                 <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12">
                    <div className="text-center md:text-left space-y-1 md:space-y-2">
                       <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Principal Narrator</p>
                       <p className="text-xl md:text-3xl font-black text-gold italic tracking-tight">{selectedHadith.narrator}</p>
                    </div>
                    <button 
                      onClick={() => handleVoiceInsight(selectedHadith)}
                      className={`w-full md:w-auto px-8 md:px-12 py-5 md:py-6 rounded-2xl md:rounded-[2rem] text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all shadow-3xl flex items-center justify-center gap-4 md:gap-6 border ${isSpeaking === selectedHadith.id ? 'bg-gold text-white border-gold' : 'bg-navy-950 dark:bg-gold text-white dark:text-navy-950 border-transparent hover:scale-105 active:scale-95'}`}
                    >
                      <SpeakerIcon className="w-5 h-5 md:w-6 md:h-6" />
                      {isSpeaking === selectedHadith.id ? 'Recitation Stream...' : 'Listen to Wisdom'}
                    </button>
                 </div>
               </div>
            </div>
           </div>
           
           <div className="flex justify-center pt-10">
              <button 
                onClick={() => { setSelectedHadith(null); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                className="px-12 md:px-16 py-5 md:py-6 bg-slate-100 dark:bg-navy-900 text-slate-500 font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] rounded-[1.5rem] md:rounded-[2rem] hover:bg-gold hover:text-white transition-all shadow-xl"
              >
                Return to Vault
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default HadithVault;
