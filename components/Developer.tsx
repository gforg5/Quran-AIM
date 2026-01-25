
import React from 'react';
import { UserIcon, MalikLogo } from './Icons';

const Developer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="glass-premium rounded-[4rem] overflow-hidden border border-gold/10 shadow-3xl bg-white dark:bg-navy-900/20">
        <div className="h-56 bg-navy-950 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <MalikLogo className="w-full h-full scale-150 text-gold" />
          </div>
          <div className="relative z-10 w-40 h-40 rounded-full flex items-center justify-center border-4 border-gold shadow-2xl overflow-hidden bg-navy-900">
            <img 
              src="https://avatars.githubusercontent.com/u/113275790?v=4" 
              alt="Sayed Mohsin Ali" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="p-12 text-center space-y-8">
          <div>
            <h2 className="text-4xl font-black text-navy-950 dark:text-white tracking-tighter uppercase">Sayed Mohsin Ali</h2>
            <div className="inline-flex items-center gap-3 mt-4 px-6 py-2 bg-gold/10 border border-gold/20 rounded-full">
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse"></span>
              <span className="text-gold text-[10px] font-black uppercase tracking-widest">Systems Developer</span>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xl font-medium text-slate-600 dark:text-slate-100 max-w-2xl mx-auto leading-relaxed italic">
              "This app helps you to recite and listen to the Holy Quran, explore authenticated Hadith, and access divine knowledge with ease. Designed for the spiritual growth of the global community."
            </p>
            <p className="text-sm font-bold text-slate-400 dark:text-gold/60 uppercase tracking-widest">
              Sayed Mohsin Ali • Systems Developer
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-8">
            {[
              { label: 'Specialization', val: 'Quranic Systems' },
              { label: 'Platform', val: 'Quran AIM (Al-Malik)' },
              { label: 'Focus', val: 'Spiritual Utility' }
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-slate-50 dark:bg-navy-950/40 rounded-3xl border border-gold/5">
                <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-sm font-black text-navy-950 dark:text-white">{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developer;
