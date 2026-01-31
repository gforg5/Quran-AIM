
import React, { useState, useEffect, useRef } from 'react';
import { PrayerTimes, Ayah, Hadith, AppTab } from '../types';
import { MalikLogo, FajrIcon, SunriseIcon, DhuhrIcon, AsrIcon, MaghribIcon, IshaIcon, SpeakerIcon } from './Icons';
import { speakGuidance, decodeAudio, decodeAudioData } from '../services/geminiService';

interface DashboardProps {
  setActiveTab: (tab: AppTab) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [voiceLoading, setVoiceLoading] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const urduNames: Record<string, string> = {
    Fajr: "فجر",
    Sunrise: "طلوعِ آفتاب",
    Dhuhr: "ظہر",
    Asr: "عصر",
    Maghrib: "مغرب",
    Isha: "عشاء"
  };

  const prayerIcons: Record<string, React.ReactNode> = {
    Fajr: <FajrIcon className="w-6 h-6" />,
    Sunrise: <SunriseIcon className="w-6 h-6" />,
    Dhuhr: <DhuhrIcon className="w-6 h-6" />,
    Asr: <AsrIcon className="w-6 h-6" />,
    Maghrib: <MaghribIcon className="w-6 h-6" />,
    Isha: <IshaIcon className="w-6 h-6" />,
  };

  const format12h = (time24: string) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const stopAudio = () => {
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch(e) {}
      activeSourceRef.current = null;
    }
    setPlayingId(null);
    setVoiceLoading(null);
  };

  const handleVoicePlay = async (text: string, lang: 'en' | 'ur', id: string) => {
    // If clicking same button that is already playing/loading, stop it
    if (playingId === id || voiceLoading === id) {
      stopAudio();
      return;
    }

    // Stop anything currently playing
    stopAudio();
    
    setVoiceLoading(id);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
      const base64 = await speakGuidance(text, lang === 'ur');
      const audioBytes = decodeAudio(base64);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setPlayingId(null);
        setVoiceLoading(null);
      };

      activeSourceRef.current = source;
      setVoiceLoading(null);
      setPlayingId(id);
      source.start();
    } catch (err) {
      console.error(err);
      setVoiceLoading(null);
      setPlayingId(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const latitude = 24.8607;
        const longitude = 67.0011;
        
        const pRes = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=1`);
        const pData = await pRes.json();
        setTimes(pData.data.timings);

        // Fetch Surah Ta-Ha Ayah 7
        const aRes = await fetch(`https://api.alquran.cloud/v1/ayah/20:7/editions/quran-uthmani,en.sahih,ur.jalandhry`);
        const aData = await aRes.json();
        setAyah({
          number: aData.data[0].number,
          text: aData.data[0].text,
          translation: aData.data[1].text,
          urduTranslation: aData.data[2].text,
          audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/2353.mp3`,
          numberInSurah: aData.data[0].numberInSurah,
          surah: aData.data[0].surah
        });

        setHadith({
          id: '1',
          collection: 'Sahih Bukhari',
          hadithNumber: '1',
          text: "Actions are but by intentions, and every man shall have only that which he intended.",
          urduText: "اعمال کا دارومدار نیتوں پر ہے اور ہر انسان کے لیے وہی ہے جس کی اس نے نیت کی۔",
          source: "Sahih Bukhari",
          narrator: "Umar ibn al-Khattab"
        });

      } catch (err) {
        console.error("Dashboard Sync Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => stopAudio();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
      <div className="relative">
        <MalikLogo className="w-16 h-16 text-gold animate-sacred-glow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-gold/20 rounded-full animate-ping"></div>
        </div>
      </div>
      <p className="text-gold font-black uppercase tracking-[0.4em] text-[8px] animate-pulse">QURAN AL-MALIK</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto px-2">
      <section className="relative h-[400px] md:h-[500px] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-b-4 md:border-b-8 border-gold group">
        <img 
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          alt="Makkah Holy Kaaba"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-transparent flex items-center">
          <div className="p-6 md:p-20 space-y-4 md:space-y-6 max-w-4xl animate-in slide-in-from-left duration-700">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 backdrop-blur-xl rounded-full border border-gold/40">
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></span>
                <span className="text-gold text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em]">ISLAMIC KNOWLEDGE (اسلامی معلومات)</span>
             </div>
             <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter leading-tight playfair italic">
               THE HOLY <span className="text-gradient-gold">QURAN</span>
             </h1>
             <p className="text-emerald-50/80 text-[10px] md:text-xl font-black max-w-2xl leading-relaxed uppercase tracking-widest">
               READ AND LISTEN TO ALL 114 SURAHS WITH CLEAR TRANSLATION.
             </p>
             <div className="flex flex-row gap-3 pt-4">
                <button 
                  onClick={() => setActiveTab(AppTab.QURAN)}
                  className="px-6 md:px-10 py-3 md:py-4 bg-gold text-navy-950 font-black rounded-xl md:rounded-2xl shadow-xl hover:bg-gold-light transition-all active:scale-95 uppercase tracking-widest text-[8px] md:text-[10px]"
                >
                  READ QURAN (قرآن پڑھیں)
                </button>
                <button 
                  onClick={() => setActiveTab(AppTab.TOOLS)}
                  className="px-6 md:px-10 py-3 md:py-4 bg-white/10 backdrop-blur-md text-white font-black rounded-xl md:rounded-2xl hover:bg-white/20 transition-all border border-white/20 uppercase tracking-widest text-[8px] md:text-[10px]"
                >
                  PRAYER TIMES (اوقات نماز)
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Prayer Times Section */}
      <section className="space-y-6">
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-3">
             <h3 className="text-xl md:text-3xl font-black text-navy-950 dark:text-white uppercase tracking-tighter italic">
               Prayer Times <span className="text-gold not-italic">اوقات نماز</span>
             </h3>
          </div>
          <p className="text-[9px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
            Note: Times vary by city. These calculations are based on Karachi.
            <br className="hidden md:block"/>
            (نوٹ: اوقات شہر کے لحاظ سے مختلف ہوتے ہیں۔ یہ حسابات کراچی کے مطابق ہیں۔)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {times && (Object.entries(times) as [string, string][]).filter(([k]) => ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(k)).map(([name, time]) => (
            <div key={name} className="glass-ui p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col items-center hover:shadow-xl transition-all border border-gold/5 bg-white/5 dark:bg-navy-900/40">
               <div className="w-10 h-10 md:w-14 md:h-14 bg-navy-900/50 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-gold">{prayerIcons[name]}</span>
               </div>
               <div className="text-center">
                  <span className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{name}</span>
                  <span className="block arabic-text text-sm md:text-lg text-gold font-bold mb-1">{urduNames[name]}</span>
                  <span className="text-sm md:text-lg font-black text-navy-950 dark:text-white tabular-nums">{format12h(time)}</span>
               </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 md:gap-8">
        {/* Ayah Card */}
        <div className="bg-emerald-950 rounded-[2rem] md:rounded-[4rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center border-l-4 md:border-l-[12px] border-gold min-h-[500px]">
           <div className="relative z-10 space-y-6 text-center">
              <span className="px-3 py-1 bg-gold/20 border border-gold/40 rounded-full text-gold text-[7px] md:text-[9px] font-black tracking-widest uppercase">Daily Verse (آیت)</span>
              {ayah && (
                <>
                  <p className="arabic-text text-3xl md:text-4xl leading-relaxed text-center text-gradient-gold">
                    {ayah.text}
                  </p>
                  <div className="pt-6 border-t border-white/10 space-y-4">
                     <div className="space-y-2">
                        <p className="text-gold/90 font-bold text-sm md:text-lg italic px-4">"{ayah.translation}"</p>
                        <p className="arabic-text text-lg md:text-2xl text-emerald-100 font-bold px-4">{ayah.urduTranslation}</p>
                     </div>
                     <p className="text-gold font-black text-[10px] md:text-sm">
                        {ayah.surah?.name} • {ayah.surah?.englishName} • Ayah {ayah.numberInSurah}
                     </p>
                     <div className="flex flex-col items-center gap-2">
                       <div className="flex justify-center gap-4">
                          <button 
                            onClick={() => handleVoicePlay(ayah.translation!, 'en', 'ayah-en')} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${playingId === 'ayah-en' ? 'bg-gold text-navy-950' : voiceLoading === 'ayah-en' ? 'bg-white/5 text-gold animate-pulse' : 'bg-white/5 text-gold hover:bg-gold hover:text-navy-950'}`}
                          >
                            <SpeakerIcon className="w-4 h-4" /> {voiceLoading === 'ayah-en' ? 'Connecting...' : playingId === 'ayah-en' ? 'Stop English' : 'Listen English'}
                          </button>
                          <button 
                            onClick={() => handleVoicePlay(ayah.urduTranslation!, 'ur', 'ayah-ur')} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${playingId === 'ayah-ur' ? 'bg-gold text-navy-950' : voiceLoading === 'ayah-ur' ? 'bg-white/5 text-gold animate-pulse' : 'bg-white/5 text-gold hover:bg-gold hover:text-navy-950'}`}
                          >
                            <SpeakerIcon className="w-4 h-4" /> {voiceLoading === 'ayah-ur' ? 'Connecting...' : playingId === 'ayah-ur' ? 'Stop Urdu' : 'Listen Urdu'}
                          </button>
                       </div>
                     </div>
                  </div>
                </>
              )}
           </div>
        </div>

        {/* Hadith Card */}
        <div className="bg-white dark:bg-navy-900 rounded-[2rem] md:rounded-[4rem] p-8 md:p-12 shadow-2xl border border-gold/10 flex flex-col justify-center min-h-[500px]">
           <div className="relative z-10 space-y-8 text-center">
              <div>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-navy-800 border border-emerald-200 dark:border-navy-700 rounded-full text-emerald-700 dark:text-emerald-400 text-[7px] md:text-[9px] font-black tracking-widest uppercase">Hadith (حدیث)</span>
              </div>
              {hadith && (
                <div className="space-y-6">
                  <p className="text-xl md:text-3xl font-black text-navy-950 dark:text-white leading-tight italic playfair">
                    "{hadith.text}"
                  </p>
                  <p className="arabic-text text-lg md:text-3xl font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    {hadith.urduText}
                  </p>
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => handleVoicePlay(hadith.text, 'en', 'hadith-en')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${playingId === 'hadith-en' ? 'bg-gold text-navy-950' : voiceLoading === 'hadith-en' ? 'bg-slate-100 dark:bg-navy-800 text-gold animate-pulse' : 'bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-gold'}`}
                    >
                      <SpeakerIcon className="w-4 h-4" /> {voiceLoading === 'hadith-en' ? 'Connecting...' : playingId === 'hadith-en' ? 'Stop English' : 'Listen English'}
                    </button>
                    <button 
                      onClick={() => handleVoicePlay(hadith.urduText!, 'ur', 'hadith-ur')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${playingId === 'hadith-ur' ? 'bg-gold text-navy-950' : voiceLoading === 'hadith-ur' ? 'bg-slate-100 dark:bg-navy-800 text-gold animate-pulse' : 'bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-gold'}`}
                    >
                      <SpeakerIcon className="w-4 h-4" /> {voiceLoading === 'hadith-ur' ? 'Connecting...' : playingId === 'hadith-ur' ? 'Stop Urdu' : 'Listen Urdu'}
                    </button>
                  </div>
                  <div className="pt-6 border-t border-slate-100 dark:border-navy-800">
                     <p className="text-gold font-black text-lg md:text-xl mb-0.5">{hadith.source}</p>
                     <p className="text-slate-400 dark:text-emerald-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Narrated by {hadith.narrator}</p>
                  </div>
                </div>
              )}
           </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
