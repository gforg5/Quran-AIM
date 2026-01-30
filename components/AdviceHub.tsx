
import React, { useState } from 'react';
import { getIslamicGuidance } from '../services/geminiService';
import { AdviceIcon, SparklesIcon, MalikLogo } from './Icons';

const AdviceHub: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [groundingUrls, setGroundingUrls] = useState<{title: string; uri: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSeekAdvice = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setAdvice(null);
    setGroundingUrls([]);
    try {
      const response = await getIslamicGuidance(`Provide practical, compassionate Islamic advice regarding this life situation: ${topic}. Focus on Quranic principles and Prophetic wisdom.`, []);
      setAdvice(response.text);
      setGroundingUrls(response.urls);
    } catch (err) {
      setError("The consultation stream was interrupted. Please rephrase your query.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-1000">
      <header className="text-center space-y-4">
        <h2 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tighter uppercase">Sovereign <span className="text-gradient-gold">Advice</span> Hub</h2>
        <p className="text-slate-500 dark:text-emerald-400 font-medium italic">Seek scholarly consultation for life's complex junctions.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
           <div className="glass-premium p-10 rounded-[3.5rem] border border-gold/10 shadow-2xl space-y-10 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-5">
                 <AdviceIcon className="w-40 h-40" />
              </div>
              <div className="space-y-6 relative z-10">
                 <label className="text-[10px] font-black text-gold uppercase tracking-[0.4em] block">Situation Input</label>
                 <textarea 
                   value={topic}
                   onChange={(e) => setTopic(e.target.value)}
                   placeholder="Describe your situation or seek guidance on an Islamic ethical dilemma..."
                   className="w-full h-56 p-8 bg-slate-50 dark:bg-royal-dark border-none rounded-[2.5rem] text-lg font-bold outline-none focus:ring-4 focus:ring-gold/20 transition-all resize-none shadow-inner"
                 />
              </div>

              <button 
                onClick={handleSeekAdvice}
                disabled={loading || !topic.trim()}
                className="w-full py-6 bg-emerald-950 dark:bg-gold text-white dark:text-emerald-950 font-black uppercase tracking-widest rounded-3xl hover:scale-[1.03] transition-all shadow-2xl disabled:opacity-50"
              >
                {loading ? 'Consulting Traditions...' : 'Request Guidance'}
              </button>
           </div>

           <div className="grid gap-4">
              {['Family Dynamics', 'Career Ethics', 'Spiritual Dryness', 'Community Service'].map(tip => (
                <button 
                  key={tip}
                  onClick={() => setTopic(`I need advice regarding ${tip.toLowerCase()}...`)}
                  className="p-5 rounded-3xl bg-white dark:bg-emerald-950/30 border border-gold/5 text-xs font-black text-slate-500 dark:text-emerald-400 uppercase tracking-widest hover:border-gold hover:text-gold transition-all flex items-center gap-4"
                >
                  <div className="w-1.5 h-1.5 bg-gold rounded-full"></div>
                  {tip}
                </button>
              ))}
           </div>
        </div>

        <div className="flex flex-col gap-8">
           {loading ? (
             <div className="flex-1 glass-premium rounded-[3.5rem] flex flex-col items-center justify-center text-center p-12 border border-gold/10 shadow-xl">
                <div className="relative">
                  <div className="w-20 h-20 border-b-2 border-gold rounded-full animate-spin"></div>
                  <MalikLogo className="w-8 h-8 text-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="mt-8 text-gold font-black uppercase tracking-widest text-xs animate-pulse">Sifting Through Sacred Scrolls</p>
             </div>
           ) : advice ? (
             <div className="flex-1 glass-premium rounded-[3.5rem] p-12 border border-gold/10 shadow-2xl overflow-y-auto max-h-[600px] animate-in slide-in-from-right">
                <div className="flex items-center gap-4 mb-10">
                   <div className="p-4 bg-gold/10 rounded-2xl text-gold">
                      <SparklesIcon className="w-6 h-6" />
                   </div>
                   <h3 className="text-sm font-black text-emerald-950 dark:text-white uppercase tracking-widest">Consultation Outcome</h3>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-emerald-100 leading-[1.8] font-medium whitespace-pre-wrap">
                   {advice}
                </div>
                {groundingUrls.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gold/10">
                    <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-4">Scholarly References</p>
                    <div className="flex flex-col gap-3">
                      {groundingUrls.map((url, idx) => (
                        <a 
                          key={idx} 
                          href={url.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs font-bold text-slate-400 hover:text-gold transition-colors flex items-center gap-2"
                        >
                          <div className="w-1 h-1 bg-gold rounded-full"></div>
                          {url.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
             </div>
           ) : (
             <div className="flex-1 glass-premium rounded-[3.5rem] border border-dashed border-gold/30 flex flex-col items-center justify-center text-center p-12 opacity-50">
                <AdviceIcon className="w-16 h-16 text-slate-400 mb-6" />
                <p className="text-slate-400 font-bold italic">Your guidance will appear here after consultation.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdviceHub;
