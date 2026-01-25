
import React from 'react';
import { MalikLogo, SparklesIcon } from './Icons';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-24 px-6 text-center space-y-16 animate-in fade-in slide-in-from-bottom duration-1000">
      <div className="space-y-6">
        <MalikLogo className="w-24 h-24 text-gold mx-auto animate-float" />
        <h2 className="text-5xl font-black text-navy-950 dark:text-white tracking-tighter uppercase italic playfair">The <span className="text-gradient-gold">Mission</span></h2>
      </div>

      <div className="glass-premium p-12 lg:p-20 rounded-[4rem] border border-gold/10 shadow-2xl space-y-10 bg-white/40 dark:bg-navy-900/40 backdrop-blur-md">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold/10 rounded-full border border-gold/20">
            <SparklesIcon className="w-3 h-3 text-gold" />
            <span className="text-gold text-[9px] font-black uppercase tracking-widest">About Al-Malik</span>
          </div>
          <h3 className="text-2xl font-bold text-navy-950 dark:text-emerald-50">Simple & Clean</h3>
        </div>

        <p className="text-xl lg:text-2xl font-medium text-slate-600 dark:text-emerald-100 leading-relaxed italic">
          "We only provide authenticated and professional access to the Holy Quran. Through Al-Malik we ensure islamic knowledge is reachable, clear, and high-quality for everyone."
        </p>

        <div className="pt-10 border-t border-gold/20 flex flex-col md:flex-row justify-center items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,0.4)]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-navy-950 dark:text-slate-400">Al-Malik App</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,0.4)]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-navy-950 dark:text-slate-400">Sovereign Knowledge</span>
           </div>
        </div>
      </div>
      
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Wisdom for the Sincere.</p>
    </div>
  );
};

export default About;
