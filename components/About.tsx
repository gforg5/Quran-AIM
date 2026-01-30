
import React from 'react';
import { MalikLogo, SparklesIcon } from './Icons';

const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 md:py-20 px-4 text-center space-y-10 animate-in fade-in slide-in-from-bottom duration-1000">
      <div className="space-y-4">
        <MalikLogo className="w-16 h-16 md:w-24 text-gold mx-auto animate-float" />
        <h2 className="text-3xl md:text-5xl font-black text-navy-950 dark:text-white tracking-tighter uppercase italic playfair">The Mission</h2>
      </div>

      <div className="glass-premium p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-gold/10 shadow-2xl space-y-10 bg-white/50 dark:bg-navy-900/40 backdrop-blur-lg">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 rounded-full border border-gold/20">
            <SparklesIcon className="w-3 h-3 text-gold" />
            <span className="text-gold text-[8px] md:text-[10px] font-black uppercase tracking-widest">About Al-Malik (ہمارے بارے میں)</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-navy-950 dark:text-emerald-50 tracking-tighter">ISLAMIC KNOWLEDGE FOR ALL</h3>
        </div>

        <p className="text-xl md:text-3xl font-medium text-slate-700 dark:text-emerald-100 leading-tight italic px-1 md:px-10">
          "Our goal is to provide authentic Islamic knowledge easily through modern technology for everyone."
        </p>

        <div className="pt-10 border-t border-gold/10 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-10">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
              <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-navy-950 dark:text-slate-400">AUTHENTIC KNOWLEDGE</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
              <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-navy-950 dark:text-slate-400">EASY TO LEARN</span>
           </div>
        </div>
      </div>
      
      <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">LEARN AND GROW WITH QURAN.</p>
    </div>
  );
};

export default About;
