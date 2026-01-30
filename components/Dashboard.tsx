
import React, { useState, useEffect } from 'react';
import { PrayerTimes, Ayah, Hadith, AppTab } from '../types';
import { MalikLogo, QuranIcon, SparklesIcon } from './Icons';

interface DashboardProps {
  setActiveTab: (tab: AppTab) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej)
        ).catch(() => ({ coords: { latitude: 21.4225, longitude: 39.8262 } }) as any);
        
        const { latitude, longitude } = pos.coords;
        const pRes = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`);
        const pData = await pRes.json();
        setTimes(pData.data.timings);

        const randomAyahNum = Math.floor(Math.random() * 6236) + 1;
        const aRes = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyahNum}/editions/quran-uthmani,en.sahih`);
        const aData = await aRes.json();
        setAyah({
          number: aData.data[0].number,
          text: aData.data[0].text,
          audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${randomAyahNum}.mp3`,
          numberInSurah: aData.data[0].numberInSurah,
          surah: aData.data[0].surah
        });

        setHadith({
          id: '1',
          collection: 'Sahih Bukhari',
          hadithNumber: '1',
          text: "Actions are but by intentions, and every man shall have only that which he intended.",
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
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 animate-in fade-in">
      <div className="relative">
        <MalikLogo className="w-20 h-20 text-gold animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 border-2 border-gold/20 rounded-full animate-ping"></div>
        </div>
      </div>
      <p className="text-gold font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Initializing Sanctuary...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Improved Hero Section */}
      <section className="relative h-[380px] md:h-[520px] rounded-[3rem] md:rounded-[4rem] overflow-hidden group shadow-2xl border-b-4 md:border-b-8 border-gold">
        <img 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          alt="Islamic Art"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-transparent flex items-center">
          <div className="p-8 md:p-24 space-y-4 md:space-y-8 max-w-4xl animate-in slide-in-from-left duration-1000">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/20 backdrop-blur-xl rounded-full border border-gold/40 shadow-lg">
                <span className="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
                <span className="text-gold text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">SOVEREIGN WISDOM</span>
             </div>
             <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter leading-tight playfair italic">
               THE HOLY <span className="text-gradient-gold">QURAN</span>
             </h1>
             <p className="text-emerald-50/70 text-sm md:text-2xl font-bold max-w-3xl leading-relaxed uppercase tracking-wide">
               READ AND LISTEN TO ALL 114 SURAHS WITH CLEAR TRANSLATION.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => setActiveTab(AppTab.QURAN)}
                  className="px-8 py-4 bg-gold text-emerald-950 font-black rounded-2xl shadow-xl hover:bg-gold-light transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                >
                  READ QURAN
                </button>
                <button 
                  onClick={() => setActiveTab(AppTab.TOOLS)}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-black rounded-2xl hover:bg-white/20 transition-all border border-white/20 uppercase tracking-widest text-[10px]"
                >
                  PRAYER TIMES
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Prayer Times Grid - Responsive for mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
        {times && Object.entries(times).filter(([k]) => ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(k)).map(([name, time]) => (
          <div key={name} className="glass-ui p-5 md:p-8 rounded-[2rem] flex flex-col items-center hover:shadow-xl transition-all group border border-gold/5">
             <div className="w-10 h-10 md:w-16 md:h-16 bg-slate-50 dark:bg-navy-900 rounded-xl flex items-center justify-center mb-3 md:mb-5 group-hover:bg-gold transition-all duration-500">
                <span className="text-emerald-950 dark:text-gold group-hover:text-emerald-950 font-black text-sm md:text-lg">{name[0]}</span>
             </div>
             <span className="text-[8px] md:text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest mb-1">{name}</span>
             <span className="text-lg md:text-2xl font-black text-emerald-950 dark:text-white tabular-nums">{time}</span>
          </div>
        ))}
      </div>

      <section className="grid lg:grid-cols-2 gap-6 md:gap-10">
        <div className="bg-emerald-950 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[400px] border-l-[8px] md:border-l-[12px] border-gold">
           <div className="relative z-10 space-y-8 text-center">
              <span className="px-4 py-1.5 bg-gold/20 border border-gold/40 rounded-full text-gold text-[8px] md:text-[10px] font-black tracking-widest uppercase shadow-lg">Daily Verse</span>
              {ayah && (
                <>
                  <p className="arabic-text text-3xl md:text-5xl leading-[1.8] text-center drop-shadow-2xl text-gradient-gold">
                    {ayah.text}
                  </p>
                  <div className="pt-6 border-t border-white/10 space-y-3">
                     <div>
                       <p className="text-gold font-black text-xl md:text-2xl mb-1 italic">Surah {ayah.surah?.englishName}</p>
                       <p className="text-emerald-200/50 text-[10px] font-bold uppercase tracking-widest">Ayah {ayah.numberInSurah} • {ayah.surah?.name}</p>
                     </div>
                     <audio controls src={ayah.audio} className="w-full max-w-xs mx-auto h-8 opacity-40 hover:opacity-100 transition-all filter invert" />
                  </div>
                </>
              )}
           </div>
        </div>

        <div className="bg-white dark:bg-emerald-900/40 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 shadow-2xl border border-gold/10 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
           <div className="relative z-10 space-y-8 text-center">
              <div>
                <span className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-800 border border-emerald-200 dark:border-emerald-700 rounded-full text-emerald-700 dark:text-emerald-100 text-[8px] md:text-[10px] font-black tracking-widest uppercase">Prophetic Wisdom</span>
              </div>
              {hadith && (
                <>
                  <p className="text-2xl md:text-4xl font-black text-emerald-950 dark:text-white leading-tight italic playfair">
                    "{hadith.text}"
                  </p>
                  <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                     <p className="text-gold font-black text-lg md:text-xl mb-1">{hadith.source}</p>
                     <p className="text-slate-400 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Narrated by {hadith.narrator}</p>
                  </div>
                </>
              )}
           </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
