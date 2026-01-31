
import React from 'react';
import { MalikLogo } from './Icons';

const Developer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-6 md:py-12 px-2 animate-in fade-in duration-700">
      <div className="glass-ui rounded-[2.5rem] md:rounded-[4rem] overflow-hidden border border-gold/10 shadow-3xl bg-white dark:bg-navy-900/40">
        <div className="h-32 md:h-56 bg-navy-950 flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-10">
            <MalikLogo className="w-full h-full scale-150 text-gold" />
          </div>
          <div className="relative z-10 w-28 h-28 md:w-40 md:h-40 rounded-full flex items-center justify-center border-2 md:border-4 border-gold shadow-2xl overflow-hidden bg-navy-900">
            <img 
              src="https://github.com/gforg5/Nano-Lens/blob/main/1769069098374.png?raw=true" 
              alt="Sayed Mohsin Ali" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <div className="p-6 md:p-12 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-4xl font-black text-navy-950 dark:text-white tracking-tighter uppercase inline-block">
              SAYED MOHSIN ALI
            </h2>
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full">
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></span>
                <span className="text-gold text-[7px] md:text-[9px] font-black uppercase tracking-widest">SMA • AL-MALIK WEB-SYSTEMS DEVELOPER</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-xs md:text-xl font-medium text-slate-600 dark:text-slate-100 max-w-xl mx-auto leading-relaxed italic">
                "Building Web-Systems that connect with modern technology for the Islamic, religious, and spiritual benefit of all."
              </p>
              <p className="arabic-text text-sm md:text-lg text-gold font-bold leading-relaxed">
                سب کے اسلامی، مذہبی اور روحانی فائدے کے لیے جدید ٹکنالوجی سے مربوط ویب سسٹم بنانا۔
              </p>
            </div>
            <p className="text-[7px] md:text-xs font-black text-slate-400 dark:text-gold/50 uppercase tracking-[0.3em]">
              SMA • AL-MALIK WEB-SYSTEMS DEVELOPER
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-4">
            {[
              { label: 'SPECIALIZATION', val: 'SYSTEMS DEVELOPMENT' },
              { label: 'Network', val: 'Al-Malik Global' },
              { label: 'Vision', val: 'ISLAMIC UNITY' }
            ].map((stat, i) => (
              <div key={i} className="p-3 md:p-4 bg-slate-50 dark:bg-navy-950/60 rounded-[1.5rem] border border-gold/5 flex flex-col justify-center min-h-[70px]">
                <p className="text-[6px] md:text-[8px] font-black text-gold uppercase tracking-tighter mb-0.5">{stat.label}</p>
                <p className="text-[8px] md:text-xs font-black text-navy-950 dark:text-white uppercase whitespace-nowrap overflow-hidden text-ellipsis">{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developer;
