
import React from 'react';
import { MalikLogo } from './Icons';

const Developer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-2 sm:px-6 animate-in fade-in duration-700">
      <div className="glass-ui rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-gold/10 shadow-3xl bg-white dark:bg-navy-900/20">
        <div className="h-40 md:h-56 bg-navy-950 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <MalikLogo className="w-full h-full scale-150 text-gold" />
          </div>
          <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border-2 md:border-4 border-gold shadow-2xl overflow-hidden bg-navy-900">
            <img 
              src="https://avatars.githubusercontent.com/u/113275790?v=4" 
              alt="Sayed Mohsin Ali" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="p-8 md:p-12 text-center space-y-6 md:space-y-8">
          <div>
            {/* Fixed Name Layout for Mobile */}
            <h2 className="text-2xl md:text-4xl font-black text-navy-950 dark:text-white tracking-tighter uppercase whitespace-normal md:whitespace-nowrap">
              SAYED MOHSIN ALI
            </h2>
            <div className="inline-flex items-center gap-2 mt-3 md:mt-4 px-4 py-1.5 bg-gold/10 border border-gold/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></span>
              <span className="text-gold text-[8px] md:text-[10px] font-black uppercase tracking-widest">Systems Developer</span>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <p className="text-sm md:text-xl font-medium text-slate-600 dark:text-slate-100 max-w-2xl mx-auto leading-relaxed italic">
              "Building tools that bridge ancient wisdom with modern technology for the spiritual benefit of all."
            </p>
            <p className="text-[9px] md:text-sm font-bold text-slate-400 dark:text-gold/60 uppercase tracking-widest">
              SAYED MOHSIN ALI • AL-MALIK SYSTEMS
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-8">
            {[
              { label: 'Specialization', val: 'Quranic AI' },
              { label: 'Network', val: 'Al-Malik Global' },
              { label: 'Vision', val: 'Sovereign Utility' }
            ].map((stat, i) => (
              <div key={i} className="p-4 md:p-6 bg-slate-50 dark:bg-navy-950/40 rounded-[1.5rem] md:rounded-3xl border border-gold/5">
                <p className="text-[8px] md:text-[10px] font-black text-gold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-[11px] md:text-sm font-black text-navy-950 dark:text-white uppercase">{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developer;
