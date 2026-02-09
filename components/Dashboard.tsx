
import React, { useState, useEffect, useRef } from 'react';
import { PrayerTimes, Ayah, Hadith, AppTab, ActiveAudio } from '../types';
import { MalikLogo, FajrIcon, SunriseIcon, DhuhrIcon, AsrIcon, MaghribIcon, IshaIcon, SpeakerIcon } from './Icons';
import { speakGuidance, decodeAudio, decodeAudioData } from '../services/geminiService';

interface DashboardProps {
  setActiveTab: (tab: AppTab) => void;
  onAudioStateChange: (audio: ActiveAudio | null) => void;
  activeAudio: ActiveAudio | null;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onAudioStateChange, activeAudio }) => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [voiceLoading, setVoiceLoading] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopAudio = () => {
    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch(e) {}
      activeSourceRef.current = null;
    }
    onAudioStateChange(null);
    setVoiceLoading(null);
  };

  const toggleFavorite = (id: string, itemData: any) => {
    setFavorites(prev => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter(f => f !== id);
        localStorage.removeItem(`almalik_fav_data_${id}`);
      } else {
        next = [...prev, id];
        localStorage.setItem(`almalik_fav_data_${id}`, JSON.stringify(itemData));
      }
      localStorage.setItem('almalik_dashboard_favs', JSON.stringify(next));
      return next;
    });
  };

  const handleVoicePlay = async (text: string, lang: 'en' | 'ur', id: string, title: string, subtitle: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    if (activeAudio?.id === id || voiceLoading === id) {
      stopAudio();
      return;
    }

    stopAudio();
    setVoiceLoading(id);

    try {
      const base64 = await speakGuidance(text, lang === 'ur');
      const audioBytes = decodeAudio(base64);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        if (activeSourceRef.current === source) {
          onAudioStateChange(null);
          setVoiceLoading(null);
        }
      };

      activeSourceRef.current = source;
      setVoiceLoading(null);
      onAudioStateChange({ id, title, subtitle, type: id.includes('ayah') ? 'ayah' : 'hadith' });
      source.start();
    } catch (err: any) {
      console.error("Dashboard Voice Error:", err);
      setVoiceLoading(null);
      onAudioStateChange(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const latitude = 24.8607;
        const longitude = 67.0011;
        
        // Fetch Prayer Times
        const pRes = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=1`);
        const pData = await pRes.json();
        setTimes(pData.data.timings);

        // Fetch Random Short Ayah (Randomized on every refresh/load)
        let foundShortAyah = false;
        let ayahAttempts = 0;
        while (!foundShortAyah && ayahAttempts < 10) {
          const randomAyahId = Math.floor(Math.random() * 6236) + 1;
          const aRes = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyahId}/editions/quran-uthmani,en.sahih,ur.jalandhry`);
          const aData = await aRes.json();
          const ayahData = aData.data[0];
          // Filter for reasonably short verses (< 180 chars)
          if (ayahData.text.length < 180 || ayahAttempts === 9) {
            setAyah({
              number: ayahData.number,
              text: ayahData.text,
              translation: aData.data[1].text,
              urduTranslation: aData.data[2].text,
              numberInSurah: ayahData.numberInSurah,
              surah: ayahData.surah
            });
            foundShortAyah = true;
          }
          ayahAttempts++;
        }

        // Expanded Hadith list for random selection on every refresh (keeping them short)
        const hadithPool: Hadith[] = [
          { 
            id: 'h-1', 
            collection: 'Sahih Bukhari', 
            hadithNumber: '1', 
            hadithArabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", 
            text: "Actions are but by intentions.", 
            urduText: "اعمال کا دارومدار نیتوں پر ہے۔", 
            narrator: "Umar ibn al-Khattab", 
            source: "Sahih Bukhari" 
          },
          { 
            id: 'h-2', 
            collection: 'Sahih Bukhari', 
            hadithNumber: '2', 
            hadithArabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", 
            text: "A Muslim is the one from whose tongue and hands the Muslims are safe.", 
            urduText: "مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں۔", 
            narrator: "Abdullah ibn Amr", 
            source: "Sahih Bukhari" 
          },
          { 
            id: 'h-4', 
            collection: 'Sahih Muslim', 
            hadithNumber: '223', 
            hadithArabic: "الطُّهُورُ شَطْرُ الإِيمَانِ", 
            text: "Cleanliness is half of faith.", 
            urduText: "صفائی نصف ایمان ہے۔", 
            narrator: "Abu Malik Al-Ash'ari", 
            source: "Sahih Muslim" 
          },
          { 
            id: 'h-5', 
            collection: 'Sahih Bukhari', 
            hadithNumber: '3', 
            hadithArabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", 
            text: "The best among you are those who learn the Quran and teach it.", 
            urduText: "تم میں سے بہترین وہ ہے جو قرآن سیکھے اور سکھائے۔", 
            narrator: "Uthman bin Affan", 
            source: "Sahih Bukhari" 
          }
        ];
        const randomHadith = hadithPool[Math.floor(Math.random() * hadithPool.length)];
        setHadith(randomHadith);

        const favs = localStorage.getItem('almalik_dashboard_favs');
        if (favs) setFavorites(JSON.parse(favs));

      } catch (err) {
        console.error("Dashboard Sync Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => stopAudio();
  }, []);

  const urduNames: Record<string, string> = { Fajr: "فجر", Sunrise: "طلوعِ آفتاب", Dhuhr: "ظہر", Asr: "عصر", Maghrib: "مغرب", Isha: "عشاء" };
  const prayerIcons: Record<string, React.ReactNode> = { Fajr: <FajrIcon className="w-6 h-6" />, Sunrise: <SunriseIcon className="w-6 h-6" />, Dhuhr: <DhuhrIcon className="w-6 h-6" />, Asr: <AsrIcon className="w-6 h-6" />, Maghrib: <MaghribIcon className="w-6 h-6" />, Isha: <IshaIcon className="w-6 h-6" /> };
  const format12h = (time24: string) => { if (!time24) return ""; const [hours, minutes] = time24.split(':').map(Number); const period = hours >= 12 ? 'PM' : 'AM'; const hours12 = hours % 12 || 12; return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`; };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
      <MalikLogo className="w-16 h-16 text-gold animate-sacred-glow" />
      <p className="text-gold font-black uppercase tracking-[0.4em] text-[8px] animate-pulse">AL-MALIK WEB</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto px-2">
      <section className="relative h-[400px] md:h-[500px] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-b-4 md:border-b-8 border-gold group">
        <img src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Kaaba" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-transparent flex items-center">
          <div className="p-6 md:p-20 space-y-4 md:space-y-6 max-w-4xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 backdrop-blur-xl rounded-full border border-gold/40">
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></span>
                <span className="text-gold text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em]">ISLAMIC KNOWLEDGE</span>
             </div>
             <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter leading-tight playfair italic uppercase">The Holy <span className="text-gradient-gold">Quran</span></h1>
             <div className="flex flex-row gap-3 pt-4">
                <button onClick={() => setActiveTab(AppTab.QURAN)} className="px-6 md:px-10 py-3 md:py-4 bg-gold text-navy-950 font-black rounded-xl md:rounded-2xl shadow-xl hover:bg-gold-light transition-all uppercase tracking-widest text-[8px] md:text-[10px]">READ QURAN</button>
                <button onClick={() => setActiveTab(AppTab.TOOLS)} className="px-6 md:px-10 py-3 md:py-4 bg-white/10 backdrop-blur-md text-white font-black rounded-xl md:rounded-2xl hover:bg-white/20 transition-all border border-white/20 uppercase tracking-widest text-[8px] md:text-[10px]">PRAYER TIMES</button>
             </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
           <h2 className="text-xl md:text-3xl font-black text-navy-950 dark:text-white uppercase tracking-tighter playfair italic">Prayer Times</h2>
           <div className="text-right">
             <p className="text-[7px] md:text-[9px] font-black text-gold uppercase tracking-widest leading-none">Note: Prayer times vary by location. These times are for Karachi, Pakistan.</p>
             <p className="arabic-text text-[10px] md:text-[12px] text-slate-500 font-bold mt-1">نوٹ: نماز کے اوقات مقام کے لحاظ سے مختلف ہو سکتے ہیں۔ یہ اوقات کراچی، پاکستان کے لیے ہیں۔</p>
           </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {times && (Object.entries(times) as [string, string][]).filter(([k]) => ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(k)).map(([name, time]) => (
            <div key={name} className="glass-ui p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col items-center border border-gold/5 bg-white/5 dark:bg-navy-900/40">
               <div className="w-10 h-10 md:w-14 md:h-14 bg-navy-900/50 rounded-xl flex items-center justify-center mb-3"><span className="text-gold">{prayerIcons[name]}</span></div>
               <div className="text-center">
                  <span className="block text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{name}</span>
                  <span className="block arabic-text text-sm md:text-lg text-gold font-bold mb-1">{urduNames[name]}</span>
                  <span className="text-sm md:text-lg font-black text-navy-950 dark:text-white tabular-nums">{format12h(time)}</span>
               </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
        <div className="bg-emerald-950 rounded-[2rem] md:rounded-[4rem] p-8 md:p-12 md:pt-16 text-white shadow-2xl relative overflow-hidden flex flex-col justify-start border-l-4 md:border-l-[12px] border-gold min-h-[450px] lg:min-h-[550px]">
           <div className="relative z-10 space-y-6 text-center">
              <div className="flex justify-center items-center gap-3">
                <span className="px-3 py-1 bg-gold/20 border border-gold/40 rounded-full text-gold text-[7px] md:text-[9px] font-black tracking-widest uppercase">Daily Verse</span>
                {ayah && (
                  <button onClick={() => toggleFavorite(`ayah-${ayah.number}`, { type: 'ayah', ...ayah })} className={`transition-all ${favorites.includes(`ayah-${ayah.number}`) ? 'text-gold' : 'text-gold/40 hover:text-gold'}`}>
                    <svg className="w-5 h-5" fill={favorites.includes(`ayah-${ayah.number}`) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  </button>
                )}
              </div>
              {ayah && (
                <>
                  <p className="arabic-text text-3xl md:text-4xl lg:text-5xl leading-relaxed text-gradient-gold line-clamp-4">{ayah.text}</p>
                  <div className="pt-6 border-t border-white/10 space-y-6">
                     <div className="space-y-4">
                        <p className="text-gold/90 font-bold text-sm md:text-lg lg:text-xl italic px-4">"{ayah.translation}"</p>
                        <p className="arabic-text text-lg md:text-2xl lg:text-3xl text-emerald-100 font-bold px-4">{ayah.urduTranslation}</p>
                     </div>
                     <div className="flex justify-center gap-4">
                        <button onClick={() => handleVoicePlay(ayah.translation!, 'en', 'ayah-en', ayah.surah?.englishName || 'Ayah', `Verse ${ayah.numberInSurah}`)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeAudio?.id === 'ayah-en' ? 'bg-gold text-navy-950' : voiceLoading === 'ayah-en' ? 'bg-white/5 text-gold animate-pulse' : 'bg-white/5 text-gold hover:bg-gold hover:text-navy-950'}`}>
                          <SpeakerIcon className="w-4 h-4" /> {voiceLoading === 'ayah-en' ? 'Connecting...' : activeAudio?.id === 'ayah-en' ? 'Stop' : 'English'}
                        </button>
                        <button onClick={() => handleVoicePlay(ayah.urduTranslation!, 'ur', 'ayah-ur', ayah.surah?.englishName || 'Ayah', `اردو ترجمہ - Verse ${ayah.numberInSurah}`)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeAudio?.id === 'ayah-ur' ? 'bg-gold text-navy-950' : voiceLoading === 'ayah-ur' ? 'bg-white/5 text-gold animate-pulse' : 'bg-white/5 text-gold hover:bg-gold hover:text-navy-950'}`}>
                          <SpeakerIcon className="w-4 h-4" /> {voiceLoading === 'ayah-ur' ? 'Connecting...' : activeAudio?.id === 'ayah-ur' ? 'Stop' : 'Urdu'}
                        </button>
                     </div>
                  </div>
                </>
              )}
           </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-[2rem] md:rounded-[4rem] p-8 md:p-12 md:pt-16 shadow-2xl border border-gold/10 flex flex-col justify-start min-h-[450px] lg:min-h-[550px]">
           <div className="relative z-10 space-y-8 text-center">
              <div className="flex justify-center items-center gap-3">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-navy-800 border border-emerald-200 dark:border-navy-700 rounded-full text-emerald-700 dark:text-emerald-400 text-[7px] md:text-[9px] font-black tracking-widest uppercase">Daily Hadith</span>
                {hadith && (
                  <button onClick={() => toggleFavorite(`hadith-${hadith.id}`, { type: 'hadith', ...hadith })} className={`transition-all ${favorites.includes(`hadith-${hadith.id}`) ? 'text-gold' : 'text-gold/40 hover:text-gold'}`}>
                    <svg className="w-5 h-5" fill={favorites.includes(`hadith-${hadith.id}`) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  </button>
                )}
              </div>
              {hadith && (
                <div className="space-y-6">
                  <p className="arabic-text text-2xl md:text-3xl lg:text-4xl font-bold text-gold leading-relaxed">{hadith.hadithArabic}</p>
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="space-y-4">
                      <p className="text-xl md:text-2xl font-black text-navy-950 dark:text-white leading-tight italic playfair">"{hadith.text}"</p>
                      <p className="arabic-text text-lg md:text-2xl font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed">{hadith.urduText}</p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button onClick={() => handleVoicePlay(hadith.text, 'en', `hadith-en-${hadith.id}`, 'Hadith', hadith.collection)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeAudio?.id === `hadith-en-${hadith.id}` ? 'bg-gold text-navy-950' : voiceLoading === `hadith-en-${hadith.id}` ? 'bg-slate-100 dark:bg-navy-800 text-gold animate-pulse' : 'bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-gold'}`}>
                        <SpeakerIcon className="w-4 h-4" /> {voiceLoading === `hadith-en-${hadith.id}` ? 'Connecting...' : activeAudio?.id === `hadith-en-${hadith.id}` ? 'Stop' : 'English'}
                      </button>
                      <button onClick={() => handleVoicePlay(hadith.urduText!, 'ur', `hadith-ur-${hadith.id}`, 'حدیث', hadith.urduText || 'صحیح بخاری')} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeAudio?.id === `hadith-ur-${hadith.id}` ? 'bg-gold text-navy-950' : voiceLoading === `hadith-ur-${hadith.id}` ? 'bg-slate-100 dark:bg-navy-800 text-gold animate-pulse' : 'bg-slate-100 dark:bg-navy-800 text-slate-400 hover:text-gold'}`}>
                        <SpeakerIcon className="w-4 h-4" /> {voiceLoading === `hadith-ur-${hadith.id}` ? 'Connecting...' : activeAudio?.id === `hadith-ur-${hadith.id}` ? 'Stop' : 'Urdu'}
                      </button>
                    </div>
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
