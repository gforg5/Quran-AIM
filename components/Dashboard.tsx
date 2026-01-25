
import React, { useState, useEffect } from 'react';
import { PrayerTimes, Ayah, Hadith, AppTab } from '../types';
import { MalikLogo, SparklesIcon, CompassIcon, BookOpenIcon, ToolsIcon } from './Icons';

const Dashboard: React.FC = () => {
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
        );
        const { latitude, longitude } = pos.coords;
        const pRes = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`);
        const pData = await pRes.json();
        setTimes(pData.data.timings);

        const randomAyahNum = Math.floor(Math.random() * 6236) + 1;
        const aRes = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyahNum}/editions/quran-uthmani,en.sahih`);
        const aData = await aRes.json();
        // Added required 'number' property to match Ayah interface
        setAyah({
          number: aData.data[0].number,
          text: aData.data[0].text,
          audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${randomAyahNum}.mp3`,
          numberInSurah: aData.data[0].numberInSurah,
          surah: aData.data[0].surah
        });

        // Added required 'id' property to match Hadith interface
        setHadith({
          id: '1',
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
        <MalikLogo className="w-24 h-24 text-gold animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-gold/20 rounded-full animate-ping"></div>
        </div>
      </div>
      <p className="text-gold font-black uppercase tracking-[0.5em] text-xs animate-pulse">Connecting to Hub...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <section className="relative h-[480px] rounded-[4rem] overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-b-8 border-gold">
        <img 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          alt="Islamic Art"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/70 to-transparent flex items-center">
          <div className="p-12 md:p-24 space-y-8 max-w-4xl animate-in slide-in-from-left duration-1000">
             <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gold/20 backdrop-blur-xl rounded-full border border-gold/40 shadow-xl">
                <span className="w-2.5 h-2.5 bg-gold rounded-full animate-pulse"></span>
                <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Islamic Wisdom Mode</span>
             </div>
             <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none playfair italic">
               Discover the <span className="text-gradient-gold">Beauty</span> of Islam.
             </h1>
             <p className="text-emerald-50/70 text-lg md:text-2xl font-medium max-w-3xl leading-relaxed">
               Welcome to your digital sanctuary. Learn the truth and find peace in every word.
             </p>
             <div className="flex gap-6 pt-4">
                <button className="px-10 py-5 bg-gold text-emerald-950 font-black rounded-2xl shadow-2xl hover:bg-gold-light transition-all active:scale-95 uppercase tracking-widest text-xs">Read Quran</button>
                <button className="px-10 py-5 bg-white/10 backdrop-blur-md text-white font-black rounded-2xl hover:bg-white/20 transition-all border border-white/20 uppercase tracking-widest text-xs">Daily Prayer</button>
             </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {times && Object.entries(times).filter(([k]) => ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(k)).map(([name, time]) => (
          <div key={name} className="glass-premium p-8 rounded-[2.5rem] flex flex-col items-center hover:shadow-2xl hover:-translate-y-2 transition-all group">
             <div className="w-16 h-16 bg-emerald-950/5 dark:bg-black/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-gold transition-all duration-500">
                <span className="text-emerald-900 dark:text-gold group-hover:text-emerald-950 font-black text-lg">{name[0]}</span>
             </div>
             <span className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest mb-1">{name}</span>
             <span className="text-2xl font-black text-emerald-950 dark:text-white tabular-nums">{time}</span>
          </div>
        ))}
      </div>

      <section className="grid lg:grid-cols-2 gap-10">
        <div className="bg-emerald-950 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[500px] border-l-[12px] border-gold">
           <div className="relative z-10 space-y-12 text-center">
              <span className="px-5 py-2 bg-gold/20 border border-gold/40 rounded-full text-gold text-[10px] font-black tracking-widest uppercase shadow-lg">Daily Verse</span>
              {ayah && (
                <>
                  <p className="arabic-text text-5xl md:text-6xl leading-[1.8] text-center drop-shadow-2xl text-gradient-gold">
                    {ayah.text}
                  </p>
                  <div className="pt-10 border-t border-white/10 space-y-4">
                     <div>
                       <p className="text-gold font-black text-2xl mb-1 italic">Surah {ayah.surah?.englishName}</p>
                       <p className="text-emerald-200/50 text-xs font-bold uppercase tracking-widest">Ayah {ayah.numberInSurah} • {ayah.surah?.name}</p>
                     </div>
                     <audio controls src={ayah.audio} className="w-full max-w-md mx-auto h-10 opacity-60 hover:opacity-100 transition-all filter invert" />
                  </div>
                </>
              )}
           </div>
        </div>

        <div className="bg-white dark:bg-emerald-900 rounded-[4rem] p-12 shadow-2xl border border-gold/10 relative overflow-hidden flex flex-col justify-center min-h-[500px]">
           <div className="relative z-10 space-y-12">
              <div className="text-center">
                <span className="px-5 py-2 bg-emerald-100 dark:bg-emerald-800 border border-emerald-200 dark:border-emerald-700 rounded-full text-emerald-700 dark:text-emerald-100 text-[10px] font-black tracking-widest uppercase">Prophetic Wisdom</span>
              </div>
              {hadith && (
                <>
                  <p className="text-3xl md:text-4xl font-black text-emerald-950 dark:text-white leading-tight italic playfair text-center">
                    "{hadith.text}"
                  </p>
                  <div className="pt-10 border-t border-slate-100 dark:border-white/5 text-center">
                     <p className="text-gold font-black text-xl mb-1">{hadith.source}</p>
                     <p className="text-slate-400 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">Narrated by {hadith.narrator}</p>
                  </div>
                </>
              )}
           </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { title: "Islamic Art", desc: "AI Calligraphy", icon: MalikLogo, color: "text-amber-500", tab: AppTab.ART_STUDIO },
           { title: "AI Scholar", desc: "Faith Guidance", icon: SparklesIcon, color: "text-blue-500", tab: AppTab.QURAN_AI },
           { title: "Library", desc: "Islamic Books", icon: BookOpenIcon, color: "text-emerald-500", tab: AppTab.LIBRARY },
           { title: "Faith Tools", desc: "Prayer & More", icon: ToolsIcon, color: "text-gold", tab: AppTab.TOOLS }
         ].map((f, i) => (
           <div key={i} className="glass-premium p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-3 border border-gold/5">
              <f.icon className={`w-12 h-12 ${f.color} mb-8 transition-transform group-hover:scale-125`} />
              <h5 className="font-black text-2xl text-emerald-950 dark:text-white mb-3">{f.title}</h5>
              <p className="text-slate-400 dark:text-emerald-500/70 text-[10px] font-black uppercase tracking-widest">{f.desc}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Dashboard;
