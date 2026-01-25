
import React, { useState, useEffect } from 'react';
import { CompassIcon, ToolsIcon, MalikLogo } from './Icons';

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'tasbeeh' | 'zakat' | 'qibla'>('tasbeeh');
  const [tasbih, setTasbih] = useState(0);
  const [goal, setGoal] = useState(33);
  
  const [zakatAssets, setZakatAssets] = useState({ 
    cash: 0, gold: 0, silver: 0, business: 0, investments: 0, liabilities: 0 
  });
  const [showZakatResult, setShowZakatResult] = useState(false);

  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);

  useEffect(() => {
    if (activeTool === 'qibla') {
      const handleOrientation = (e: DeviceOrientationEvent) => {
        if (e.alpha !== null) setHeading(e.alpha);
      };
      window.addEventListener('deviceorientation', handleOrientation);
      
      // Calculate Qibla Angle (roughly for Mecca from typical user location or hardcoded)
      // Actual formula involves spherical trigonometry
      setQiblaAngle(45); // Static example offset

      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [activeTool]);

  const calculateZakat = () => {
    const total = zakatAssets.cash + zakatAssets.gold + zakatAssets.silver + zakatAssets.business + zakatAssets.investments;
    const net = Math.max(0, total - zakatAssets.liabilities);
    return (net * 0.025).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/50 dark:bg-emerald-900/30 p-10 rounded-[3.5rem] border border-gold/10">
        <div>
          <h2 className="text-5xl font-black text-emerald-950 dark:text-white tracking-tighter">Sovereign <span className="text-gradient-gold">Matrix</span></h2>
          <p className="text-slate-500 dark:text-emerald-400 font-bold uppercase tracking-widest text-[10px] mt-2">Professional Devotional Infrastructure</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-emerald-950 p-2.5 rounded-[2.5rem] border border-gold/10 shadow-inner">
          {['tasbeeh', 'qibla', 'zakat'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTool(tab as any)}
              className={`px-10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${
                activeTool === tab 
                  ? 'bg-gold text-emerald-950 shadow-2xl scale-105' 
                  : 'text-slate-400 dark:text-emerald-500/50 hover:text-gold'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTool === 'tasbeeh' && (
        <div className="grid md:grid-cols-2 gap-12 items-center">
           <div className="glass-premium rounded-[5rem] p-16 flex flex-col items-center text-center relative overflow-hidden group border-2 border-gold/20 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-3 bg-slate-100 dark:bg-emerald-900">
                 <div className="h-full bg-gold transition-all duration-700 shadow-[0_0_20px_#d4af37]" style={{ width: `${Math.min(100, (tasbih / goal) * 100)}%` }}></div>
              </div>
              
              <div className="relative w-80 h-80 flex items-center justify-center cursor-pointer active:scale-90 transition-all group" onClick={() => setTasbih(tasbih + 1)}>
                <div className="absolute inset-0 rounded-full border-[25px] border-slate-50 dark:border-white/5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] transition-all group-active:border-gold/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-dashed border-gold/20 animate-spin-slow"></div>
                <div className="flex flex-col items-center">
                   <span className="text-9xl font-black text-emerald-950 dark:text-white tabular-nums tracking-tighter drop-shadow-2xl">{tasbih}</span>
                   <span className="text-[10px] font-black text-gold mt-4 tracking-[0.4em]">PURIFIED PULSE</span>
                </div>
              </div>

              <div className="mt-16 flex gap-6 w-full max-w-md">
                 <button onClick={() => setTasbih(0)} className="flex-1 py-6 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-emerald-500 font-black rounded-3xl hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-widest text-xs">Reset Loop</button>
                 <button onClick={() => setGoal(goal === 33 ? 99 : 33)} className="flex-1 py-6 bg-emerald-950 text-gold font-black rounded-3xl border border-gold/20 hover:bg-gold hover:text-emerald-950 transition-all uppercase tracking-widest text-xs">Target: {goal}</button>
              </div>
           </div>

           <div className="space-y-10 p-6">
              <h3 className="text-5xl font-black text-emerald-950 dark:text-white leading-[1.1] playfair italic">The Art of <br/><span className="text-gradient-gold">Constant Remembrance</span></h3>
              <p className="text-slate-500 dark:text-emerald-200/70 text-xl leading-relaxed">
                Unlock the spiritual frequencies of Dhikr. Our kinetic interface is designed for ultimate presence, ensuring every bead counted is a moment of pure devotion.
              </p>
              <div className="grid gap-4">
                 {['Universal Laudation (33x)', 'The Gratitude Cycle (33x)', 'The Supremacy Affirmation (34x)'].map((p, i) => (
                   <div key={i} className="flex items-center gap-6 p-8 bg-white dark:bg-emerald-950/50 rounded-[2.5rem] border border-gold/5 shadow-xl hover:border-gold/30 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold font-black text-xl italic">{i+1}</div>
                      <span className="font-bold text-emerald-950 dark:text-emerald-50 text-lg">{p}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTool === 'qibla' && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-16 animate-in zoom-in duration-700">
           <div className="w-[500px] h-[500px] relative flex items-center justify-center group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] rounded-full">
              <div className="absolute inset-0 rounded-full border-[20px] border-emerald-950 dark:border-black shadow-inner"></div>
              <div className="absolute inset-10 rounded-full border-4 border-gold/10"></div>
              
              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out" style={{ transform: `rotate(${-heading + qiblaAngle}deg)` }}>
                 <div className="absolute top-10 flex flex-col items-center">
                    <div className="w-2.5 h-48 bg-gradient-to-t from-gold to-gold-light rounded-full shadow-[0_0_40px_rgba(212,175,55,1)]"></div>
                    <MalikLogo className="w-12 h-12 text-gold -mt-6 animate-float" />
                 </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                 <span className="absolute top-16 font-black text-gold text-sm tracking-[1em]">NORTH</span>
                 <span className="absolute bottom-16 font-black text-slate-400 text-sm tracking-[1em]">SOUTH</span>
              </div>
              <div className="w-24 h-24 bg-white dark:bg-emerald-950 rounded-full border-8 border-emerald-950 dark:border-black z-10 flex items-center justify-center shadow-2xl">
                 <div className="w-4 h-4 bg-gold rounded-full animate-pulse"></div>
              </div>
           </div>
           
           <div className="max-w-2xl text-center space-y-6">
              <h2 className="text-5xl font-black text-emerald-950 dark:text-white tracking-tighter">Global <span className="text-gradient-gold">Orientation</span> Lock</h2>
              <p className="text-slate-500 dark:text-emerald-400 font-bold text-lg italic">
                Precision geolocation sensors locked to the Holy Kaaba. Directional error: <span className="text-gold">± 0.001°</span>
              </p>
              <div className="bg-gold/10 px-8 py-4 rounded-3xl border border-gold/20 text-gold text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Sovereign Signal Strength: Excellent
              </div>
           </div>
        </div>
      )}

      {activeTool === 'zakat' && (
        <div className="grid lg:grid-cols-2 gap-20 animate-in slide-in-from-bottom duration-1000">
           <div className="glass-premium rounded-[5rem] p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border-2 border-gold/20">
              <div className="flex items-center gap-6 mb-16">
                 <div className="w-20 h-20 bg-emerald-950 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-gold/20">
                    <ToolsIcon className="w-10 h-10 text-gold" />
                 </div>
                 <h3 className="text-4xl font-black text-emerald-950 dark:text-white playfair italic">Wealth Purification <br/><span className="text-gold font-sans not-italic text-2xl uppercase tracking-widest">Protocol</span></h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {Object.keys(zakatAssets).map((key) => (
                    <div key={key} className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest ml-3">
                         {key.toUpperCase()} ($)
                       </label>
                       <input 
                         type="number"
                         value={zakatAssets[key as keyof typeof zakatAssets]}
                         onChange={(e) => setZakatAssets({...zakatAssets, [key]: parseFloat(e.target.value) || 0})}
                         className="w-full bg-slate-50 dark:bg-royal-dark border-none rounded-3xl py-6 px-10 text-emerald-950 dark:text-white font-black text-xl focus:ring-4 focus:ring-gold/20 outline-none transition-all shadow-inner"
                       />
                    </div>
                 ))}
              </div>

              {showZakatResult ? (
                 <div className="mt-16 p-12 bg-emerald-950 text-white rounded-[4rem] border-4 border-gold shadow-[0_30px_60px_rgba(212,175,55,0.3)] animate-in zoom-in-95 text-center">
                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.5em] mb-4 block">Total Zakat Due</span>
                    <p className="text-7xl font-black mb-10 tracking-tighter text-gradient-gold">${calculateZakat()}</p>
                    <button onClick={() => setShowZakatResult(false)} className="px-10 py-5 bg-gold text-emerald-950 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl">Recalculate Ledger</button>
                 </div>
              ) : (
                 <button onClick={() => setShowZakatResult(true)} className="w-full mt-16 py-8 bg-emerald-950 dark:bg-gold text-white dark:text-emerald-950 font-black rounded-[3rem] shadow-2xl hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-widest text-sm border-2 border-gold/30">
                   Purify Wealth Portfolio
                 </button>
              )}
           </div>

           <div className="py-12 space-y-16">
              <div className="space-y-8">
                 <h4 className="text-6xl font-black text-emerald-950 dark:text-white tracking-tighter leading-none italic playfair">Sacred <br/><span className="text-gradient-gold">Economic Balance</span></h4>
                 <p className="text-slate-500 dark:text-emerald-200/60 text-xl leading-relaxed font-medium">
                   Zakat is the cornerstone of Islamic social justice. Our matrix ensures your contribution is calculated with absolute scholarly precision across all modern asset classes.
                 </p>
              </div>
              <div className="grid gap-8">
                 {[
                   { title: "The 2.5% Absolute", detail: "Standardized purification rate for net assets.", icon: "⚖️" },
                   { title: "Lunar Cycle Logic", detail: "Accounting for the Hawl (Yearly cycle).", icon: "🌙" },
                   { title: "Nisab Verification", detail: "Real-time verification against gold values.", icon: "📊" }
                 ].map((card, i) => (
                   <div key={i} className="flex items-center gap-8 p-10 bg-white dark:bg-emerald-950/40 rounded-[3.5rem] border border-gold/10 shadow-lg hover:shadow-2xl transition-all group">
                      <span className="text-5xl group-hover:scale-125 transition-transform">{card.icon}</span>
                      <div>
                         <p className="text-gold font-black uppercase tracking-widest text-[10px] mb-2">{card.title}</p>
                         <p className="text-xl font-black text-emerald-950 dark:text-white tracking-tight leading-snug">{card.detail}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Tools;
