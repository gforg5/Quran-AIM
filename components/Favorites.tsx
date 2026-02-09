
import React, { useState, useEffect } from 'react';
import { Ayah, Hadith } from '../types';
import { MalikLogo, SpeakerIcon } from './Icons';

const Favorites: React.FC = () => {
  const [favAyahs, setFavAyahs] = useState<Ayah[]>([]);
  const [favHadiths, setFavHadiths] = useState<Hadith[]>([]);

  useEffect(() => {
    const dashboardFavIds: string[] = JSON.parse(localStorage.getItem('almalik_dashboard_favs') || '[]');
    const ayahs: Ayah[] = [];
    const hadiths: Hadith[] = [];

    dashboardFavIds.forEach(id => {
      const data = localStorage.getItem(`almalik_fav_data_${id}`);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.type === 'ayah') ayahs.push(parsed);
        else if (parsed.type === 'hadith') hadiths.push(parsed);
      }
    });

    setFavAyahs(ayahs);
    setFavHadiths(hadiths);
  }, []);

  const removeFavorite = (id: string, type: 'ayah' | 'hadith') => {
    const dashboardFavIds: string[] = JSON.parse(localStorage.getItem('almalik_dashboard_favs') || '[]');
    const next = dashboardFavIds.filter(fid => fid !== id);
    localStorage.setItem('almalik_dashboard_favs', JSON.stringify(next));
    localStorage.removeItem(`almalik_fav_data_${id}`);
    
    if (type === 'ayah') setFavAyahs(prev => prev.filter(a => `ayah-${a.number}` !== id));
    else setFavHadiths(prev => prev.filter(h => `hadith-${h.id}` !== id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="text-center space-y-4">
        <h2 className="text-4xl md:text-6xl font-black text-navy-950 dark:text-white tracking-tighter uppercase italic playfair">Favorites <span className="text-gradient-gold">Vault</span></h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Review your saved sacred verses and prophetic traditions</p>
      </header>

      {favAyahs.length === 0 && favHadiths.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
           <div className="w-20 h-20 bg-gold/5 rounded-full flex items-center justify-center border-2 border-dashed border-gold/20">
              <svg className="w-10 h-10 text-gold/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
           </div>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Your vault is currently empty.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {favAyahs.length > 0 && (
            <section className="space-y-8">
               <h3 className="text-xl md:text-2xl font-black text-navy-950 dark:text-white uppercase tracking-widest border-l-4 border-gold pl-4">Saved Verses</h3>
               <div className="grid gap-6">
                 {favAyahs.map((a) => (
                   <div key={a.number} className="glass-ui p-8 rounded-[2rem] bg-white dark:bg-navy-900 border border-gold/10 relative group">
                      <button onClick={() => removeFavorite(`ayah-${a.number}`, 'ayah')} className="absolute top-6 right-6 text-red-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <div className="space-y-6">
                         <p className="arabic-text text-2xl md:text-4xl text-right text-slate-800 dark:text-white leading-relaxed">{a.text}</p>
                         <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 italic">"{a.translation}"</p>
                            <p className="arabic-text text-lg md:text-xl text-emerald-700 dark:text-emerald-400">{a.urduTranslation}</p>
                            <div className="flex items-center gap-2 pt-2">
                               <span className="text-[8px] font-black text-gold uppercase tracking-widest">Surah {a.surah?.englishName} • Ayah {a.numberInSurah}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </section>
          )}

          {favHadiths.length > 0 && (
            <section className="space-y-8">
               <h3 className="text-xl md:text-2xl font-black text-navy-950 dark:text-white uppercase tracking-widest border-l-4 border-emerald-500 pl-4">Saved Hadiths</h3>
               <div className="grid gap-6">
                 {favHadiths.map((h) => (
                   <div key={h.id} className="glass-ui p-8 rounded-[2rem] bg-white dark:bg-navy-900 border border-gold/10 relative group">
                      <button onClick={() => removeFavorite(`hadith-${h.id}`, 'hadith')} className="absolute top-6 right-6 text-red-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <div className="space-y-6">
                         <p className="arabic-text text-xl md:text-3xl text-right text-gold leading-relaxed">{h.hadithArabic}</p>
                         <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            <p className="text-lg md:text-xl font-black text-navy-950 dark:text-white italic playfair">"{h.text}"</p>
                            <p className="arabic-text text-lg md:text-xl text-emerald-700 dark:text-emerald-400">{h.urduText}</p>
                            <div className="flex items-center gap-2 pt-2">
                               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{h.collection} • Narrated by {h.narrator}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default Favorites;
