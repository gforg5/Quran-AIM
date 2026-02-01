
import React, { useState, useEffect } from 'react';
import { CompassIcon, CharityIcon, MalikLogo } from './Icons';

const Tools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'tasbeeh' | 'zakat' | 'qibla'>('tasbeeh');
  const [tasbih, setTasbih] = useState(0);
  const [goal, setGoal] = useState(33);
  
  // Zakat State - Accurate
  const [goldWeight, setGoldWeight] = useState(0);
  const [goldUnit, setGoldUnit] = useState<'tola' | 'gram'>('tola');
  const [goldPrice, setGoldPrice] = useState(0); // Price per tola/gram

  const [silverWeight, setSilverWeight] = useState(0);
  const [silverUnit, setSilverUnit] = useState<'tola' | 'gram'>('tola');
  const [silverPrice, setSilverPrice] = useState(0);

  const [cashAssets, setCashAssets] = useState(0);
  const [businessAssets, setBusinessAssets] = useState(0);
  const [liabilities, setLiabilities] = useState(0);
  
  const [showZakatResult, setShowZakatResult] = useState(false);

  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState(0);

  useEffect(() => {
    if (activeTool === 'qibla') {
      const handleOrientation = (e: DeviceOrientationEvent) => {
        if (e.alpha !== null) setHeading(e.alpha);
      };
      window.addEventListener('deviceorientation', handleOrientation);
      setQiblaAngle(45); 
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [activeTool]);

  const calculateZakatInfo = () => {
    // Convert weights to Tolas for logic checking
    const goldInTola = goldUnit === 'tola' ? goldWeight : goldWeight / 11.66;
    const silverInTola = silverUnit === 'tola' ? silverWeight : silverWeight / 11.66;

    const goldValue = goldWeight * goldPrice;
    const silverValue = silverWeight * silverPrice;
    
    const totalWealth = goldValue + silverValue + cashAssets + businessAssets;
    const netWealth = Math.max(0, totalWealth - liabilities);

    // Nisab Thresholds
    const nisabGoldTola = 7.5;
    const nisabSilverTola = 52.5;

    // Is Zakat Due logic
    let isDue = false;
    let reason = "";

    if (goldInTola >= nisabGoldTola) {
      isDue = true;
      reason = "Gold reaches the 7.5 Tola Nisab threshold.";
    } else if (silverInTola >= nisabSilverTola) {
      isDue = true;
      reason = "Silver reaches the 52.5 Tola Nisab threshold.";
    } else {
      // If none individually, check combined value against silver nisab (standard scholarly practice)
      const currentSilverNisabValue = nisabSilverTola * (silverUnit === 'tola' ? silverPrice : silverPrice * 11.66);
      if (netWealth >= currentSilverNisabValue) {
        isDue = true;
        reason = "Combined assets exceed the Silver Nisab threshold.";
      } else {
        isDue = false;
        reason = "Threshold not reached. No Zakat is due on these assets.";
      }
    }

    const amountDue = isDue ? netWealth * 0.025 : 0;

    return {
      amountDue: amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      isDue,
      reason,
      netWealth: netWealth.toLocaleString()
    };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 lg:space-y-12 animate-in fade-in duration-1000 px-2 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 dark:bg-emerald-900/30 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gold/10 shadow-sm">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tighter uppercase italic playfair">Explore</h2>
          <p className="text-slate-500 dark:text-emerald-400 font-bold uppercase tracking-widest text-[7px] md:text-[9px] mt-1">Helping you in your daily worship (عبادت)</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-emerald-950 p-1 md:p-1.5 rounded-full border border-gold/10 shadow-inner overflow-hidden w-full md:w-auto">
          {['tasbeeh', 'qibla', 'zakat'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTool(tab as any)}
              className={`flex-1 min-w-0 px-2 md:px-8 py-2.5 md:py-4 rounded-full text-[7px] md:text-xs font-black uppercase tracking-tighter md:tracking-widest transition-all flex items-center justify-center text-center ${
                activeTool === tab 
                  ? 'bg-gold text-emerald-950 shadow-xl' 
                  : 'text-slate-400 dark:text-emerald-500/50 hover:text-gold'
              }`}
            >
              <span className="w-full text-center">{tab === 'tasbeeh' ? 'Tasbeeh' : tab === 'qibla' ? 'Qibla' : 'Zakat'}</span>
            </button>
          ))}
        </div>
      </header>

      {activeTool === 'tasbeeh' && (
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
           <div className="glass-premium rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-10 flex flex-col items-center text-center relative overflow-hidden group border-2 border-gold/20 shadow-2xl bg-white/5 dark:bg-navy-900/20 max-w-lg mx-auto w-full">
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 dark:bg-emerald-900">
                 <div className="h-full bg-gold transition-all duration-700 shadow-[0_0_20px_#d4af37]" style={{ width: `${Math.min(100, (tasbih / goal) * 100)}%` }}></div>
              </div>
              
              <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center cursor-pointer active:scale-95 transition-all group mx-auto" onClick={() => setTasbih(tasbih + 1)}>
                <div className="absolute inset-0 rounded-full border-[12px] md:border-[18px] border-slate-50 dark:border-white/5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.1)] transition-all group-active:border-gold/10"></div>
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-gold/20"></div>
                <div className="flex flex-col items-center">
                   <span className="text-6xl md:text-8xl font-black text-emerald-950 dark:text-white tabular-nums tracking-tighter drop-shadow-2xl">{tasbih}</span>
                   <span className="text-[8px] md:text-[10px] font-black text-gold mt-2 md:mt-4 tracking-[0.4em]">Subhan Allah</span>
                </div>
              </div>

              <div className="mt-8 md:mt-12 flex gap-3 md:gap-4 w-full max-w-sm mx-auto">
                 <button onClick={() => setTasbih(0)} className="flex-1 py-3 md:py-5 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-emerald-500 font-black rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all uppercase tracking-widest text-[8px] md:text-[10px]">Reset (صفر)</button>
                 <button onClick={() => setGoal(goal === 33 ? 99 : 33)} className="flex-1 py-3 md:py-5 bg-emerald-950 text-gold font-black rounded-2xl border border-gold/20 hover:bg-gold hover:text-emerald-950 transition-all uppercase tracking-widest text-[8px] md:text-[10px]">Target: {goal}</button>
              </div>
           </div>

           <div className="space-y-6 md:space-y-10 p-4 max-w-md mx-auto text-center md:text-left">
              <h3 className="text-3xl md:text-5xl font-black text-emerald-950 dark:text-white leading-[1.1] playfair italic">Easy <br/><span className="text-gradient-gold">Dhikr Counter</span></h3>
              <p className="text-slate-500 dark:text-emerald-200/70 text-base md:text-xl leading-relaxed">
                Simple Dhikr counter for your daily remembrance of Allah. (اللہ کا ذکر)
              </p>
           </div>
        </div>
      )}

      {activeTool === 'qibla' && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 md:space-y-12 animate-in zoom-in duration-700">
           <div className="w-[260px] h-[260px] md:w-[320px] md:h-[320px] relative flex items-center justify-center group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-full bg-white dark:bg-navy-950 mx-auto">
              <div className="absolute inset-0 rounded-full border-[6px] md:border-[10px] border-emerald-950 dark:border-black shadow-inner"></div>
              <div className="absolute inset-3 md:inset-5 rounded-full border-2 border-gold/10"></div>
              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out" style={{ transform: `rotate(${-heading + qiblaAngle}deg)` }}>
                 <div className="absolute top-4 md:top-6 flex flex-col items-center">
                    <div className="w-1 md:w-1.5 h-16 md:h-24 bg-gradient-to-t from-gold to-gold-light rounded-full shadow-[0_0_30px_rgba(212,175,55,1)]"></div>
                 </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <MalikLogo className="w-8 h-8 md:w-12 md:h-12 text-gold animate-sacred-glow" />
              </div>
           </div>
           <div className="max-w-2xl text-center space-y-2 md:space-y-4">
              <h2 className="text-2xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tighter">Find <span className="text-gradient-gold">Qibla</span> Direction</h2>
              <p className="text-slate-500 dark:text-emerald-400 font-bold text-xs md:text-lg italic uppercase tracking-widest">Direction of the Kaaba (قبلہ کا رخ)</p>
           </div>
        </div>
      )}

      {activeTool === 'zakat' && (
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 animate-in slide-in-from-bottom duration-700 items-start max-w-7xl mx-auto">
           <div className="glass-premium rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-2xl border-2 border-gold/20 bg-white dark:bg-navy-900/40 w-full">
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                 <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-950 rounded-xl flex items-center justify-center shadow-2xl border border-gold/20">
                    <CharityIcon className="w-6 h-6 md:w-8 md:h-8 text-gold" />
                 </div>
                 <div>
                    <h3 className="text-xl md:text-2xl font-black text-emerald-950 dark:text-white playfair italic">Zakat Calculator</h3>
                    <p className="text-[10px] font-black text-gold uppercase tracking-widest">Calculated per Islamic Nisab Rules</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                 {/* Gold Section */}
                 <div className="space-y-3 p-4 bg-gold/5 rounded-3xl border border-gold/10">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-gold uppercase tracking-widest">Gold Weight (سونا)</label>
                      <select value={goldUnit} onChange={(e) => setGoldUnit(e.target.value as any)} className="bg-transparent text-[8px] font-black text-slate-400 border border-gold/20 rounded px-1 outline-none">
                        <option value="tola">Tola</option>
                        <option value="gram">Grams</option>
                      </select>
                    </div>
                    <input type="number" value={goldWeight || ''} onChange={(e) => setGoldWeight(parseFloat(e.target.value) || 0)} placeholder="Total Weight" className="w-full bg-white dark:bg-navy-800 rounded-xl py-3 px-4 font-black text-sm outline-none shadow-inner" />
                    <input type="number" value={goldPrice || ''} onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)} placeholder={`Price per ${goldUnit}`} className="w-full bg-white dark:bg-navy-800 rounded-xl py-3 px-4 font-black text-xs outline-none shadow-inner" />
                 </div>

                 {/* Silver Section */}
                 <div className="space-y-3 p-4 bg-slate-50 dark:bg-navy-800/20 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Silver Weight (چاندی)</label>
                      <select value={silverUnit} onChange={(e) => setSilverUnit(e.target.value as any)} className="bg-transparent text-[8px] font-black text-slate-400 border border-slate-200 rounded px-1 outline-none">
                        <option value="tola">Tola</option>
                        <option value="gram">Grams</option>
                      </select>
                    </div>
                    <input type="number" value={silverWeight || ''} onChange={(e) => setSilverWeight(parseFloat(e.target.value) || 0)} placeholder="Total Weight" className="w-full bg-white dark:bg-navy-800 rounded-xl py-3 px-4 font-black text-sm outline-none shadow-inner" />
                    <input type="number" value={silverPrice || ''} onChange={(e) => setSilverPrice(parseFloat(e.target.value) || 0)} placeholder={`Price per ${silverUnit}`} className="w-full bg-white dark:bg-navy-800 rounded-xl py-3 px-4 font-black text-xs outline-none shadow-inner" />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cash & Savings (نقدی)</label>
                    <input type="number" value={cashAssets || ''} onChange={(e) => setCashAssets(parseFloat(e.target.value) || 0)} placeholder="Cash in Bank/Home" className="w-full bg-white dark:bg-navy-800 rounded-xl py-3 px-4 font-black text-sm outline-none shadow-inner border border-slate-100 dark:border-transparent" />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Goods (تجارت)</label>
                    <input type="number" value={businessAssets || ''} onChange={(e) => setBusinessAssets(parseFloat(e.target.value) || 0)} placeholder="Value of Stock" className="w-full bg-white dark:bg-navy-800 rounded-xl py-3 px-4 font-black text-sm outline-none shadow-inner border border-slate-100 dark:border-transparent" />
                 </div>

                 <div className="space-y-3 md:col-span-2">
                    <label className="text-[9px] font-black text-red-400 uppercase tracking-widest ml-1">Liabilities / Debts (قرض)</label>
                    <input type="number" value={liabilities || ''} onChange={(e) => setLiabilities(parseFloat(e.target.value) || 0)} placeholder="Amount You Owe" className="w-full bg-red-50 dark:bg-red-950/20 rounded-xl py-3 px-4 font-black text-sm outline-none shadow-inner border border-red-100 dark:border-red-900/50" />
                 </div>
              </div>

              {showZakatResult ? (
                 <div className="mt-8 p-6 md:p-10 bg-emerald-950 text-white rounded-[2rem] border-2 border-gold shadow-2xl animate-in zoom-in-95 text-center relative overflow-hidden">
                    <div className="relative z-10">
                      <span className="text-[9px] font-black text-gold uppercase tracking-[0.4em] mb-2 block">Sovereign Calculation Results</span>
                      <div className="space-y-1 mb-6">
                        <p className="text-3xl md:text-5xl font-black tracking-tighter text-gradient-gold break-all leading-tight">
                          {calculateZakatInfo().isDue ? `Rs. ${calculateZakatInfo().amountDue}` : 'Rs. 0.00'}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-300">Net Wealth: Rs. {calculateZakatInfo().netWealth}</p>
                      </div>
                      
                      <div className={`mb-8 p-4 rounded-2xl text-[10px] font-bold leading-relaxed border ${calculateZakatInfo().isDue ? 'bg-emerald-900/50 border-emerald-500/30' : 'bg-red-900/20 border-red-500/20'}`}>
                         <p className={calculateZakatInfo().isDue ? 'text-emerald-400' : 'text-red-400'}>{calculateZakatInfo().reason}</p>
                      </div>

                      <button onClick={() => setShowZakatResult(false)} className="px-10 py-4 bg-gold text-emerald-950 font-black rounded-xl uppercase tracking-widest text-[9px] shadow-xl hover:scale-105 transition-all">Recalculate</button>
                    </div>
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                       <CharityIcon className="w-40 h-40" />
                    </div>
                 </div>
              ) : (
                 <button onClick={() => setShowZakatResult(true)} className="w-full mt-10 py-5 bg-emerald-950 dark:bg-gold text-white dark:text-emerald-950 font-black rounded-2xl shadow-2xl hover:scale-[1.02] transition-all uppercase tracking-widest text-[10px] border border-gold/30">
                   Analyze Zakat Liability
                 </button>
              )}
           </div>

           <div className="space-y-8 lg:pt-10">
              <div className="space-y-6">
                 <h4 className="text-3xl md:text-5xl font-black text-emerald-950 dark:text-white tracking-tighter leading-none italic playfair">The Law of <br/><span className="text-gradient-gold">Zakat (زکوٰۃ)</span></h4>
                 <div className="space-y-4">
                    <p className="text-slate-600 dark:text-emerald-100 text-sm md:text-lg leading-relaxed font-medium">
                      Zakat is calculated at <span className="text-gold font-black">2.5%</span> of your total net wealth after subtracting liabilities.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-5 bg-white dark:bg-navy-900/50 rounded-2xl border border-gold/10">
                          <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-1">Gold Nisab</p>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-300">7.5 Tola (87.48 Grams)</p>
                       </div>
                       <div className="p-5 bg-white dark:bg-navy-900/50 rounded-2xl border border-gold/10">
                          <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-1">Silver Nisab</p>
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-300">52.5 Tola (612.36 Grams)</p>
                       </div>
                    </div>
                    <p className="text-slate-500 dark:text-emerald-400/60 text-[10px] md:text-xs leading-relaxed italic border-l-2 border-gold/30 pl-4">
                      Note: If you possess only gold (no cash or silver), the Gold Nisab applies. If you have mixed assets, the lower (Silver) Nisab is usually used to determine liability.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Tools;
