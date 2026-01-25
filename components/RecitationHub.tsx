
import React, { useState, useRef } from 'react';
import { speakGuidance, decodeAudio, decodeAudioData } from '../services/geminiService';
import { MalikLogo, SpeakerIcon, SparklesIcon } from './Icons';

const RecitationHub: React.FC = () => {
  const [verse, setVerse] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleAnalysis = async () => {
    if (!verse.trim() || loading) return;
    setLoading(true);
    setAnalysis('');
    
    try {
      const response = await speakGuidance(`Provide a scholarly recitation of the meaning and Tajweed considerations for: ${verse}`);
      // Simulated analysis text for UI
      setAnalysis(`Deep Scholarly Analysis: The verse provided contains profound linguistic miracles. Contextually, this was revealed in Mecca...`);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const audioBytes = decodeAudio(response);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-1000">
      <header className="text-center space-y-4">
        <h2 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tighter uppercase">AI <span className="text-gradient-gold">Recitation</span> Hub</h2>
        <p className="text-slate-500 dark:text-emerald-400 font-medium">Linguistic and spiritual exploration through advanced neural synthesis.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="glass-premium p-10 rounded-[3rem] shadow-2xl space-y-8 border-2 border-gold/10">
           <div className="space-y-4">
             <label className="text-[10px] font-black text-gold uppercase tracking-[0.3em] block">Target Ayah / Concept</label>
             <textarea 
               value={verse}
               onChange={(e) => setVerse(e.target.value)}
               placeholder="Enter Surah/Ayah or a spiritual concept (e.g., Al-Fatiha)..."
               className="w-full h-48 p-6 bg-slate-50 dark:bg-royal-dark border-none rounded-3xl text-lg font-bold outline-none focus:ring-4 focus:ring-gold/20 transition-all resize-none"
             />
           </div>

           <div className="flex gap-4">
              <button 
                onClick={handleAnalysis}
                disabled={loading || !verse.trim()}
                className="flex-1 py-5 bg-emerald-950 dark:bg-gold text-white dark:text-emerald-950 font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? 'Synthesizing...' : 'Sovereign Recitation'}
              </button>
           </div>
        </div>

        <div className="flex flex-col gap-8">
           <div className={`p-8 rounded-[3rem] bg-emerald-950 text-white min-h-[300px] shadow-2xl relative overflow-hidden flex flex-col justify-center text-center transition-all ${isPlaying ? 'ring-4 ring-gold' : ''}`}>
              <div className="relative z-10 space-y-6">
                 <MalikLogo className={`w-16 h-16 text-gold mx-auto ${isPlaying ? 'animate-float' : 'opacity-20'}`} />
                 <p className="text-xl font-bold italic text-emerald-100">
                   {isPlaying ? "Neural Stream Active..." : "Select Wisdom to Begin"}
                 </p>
                 {isPlaying && (
                   <div className="flex justify-center gap-1.5 h-8 items-end">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100}%` }}></div>
                      ))}
                   </div>
                 )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent"></div>
           </div>

           {analysis && (
             <div className="p-8 rounded-[3rem] bg-white dark:bg-emerald-900/50 border border-gold/10 shadow-xl animate-in slide-in-from-bottom">
                <div className="flex items-center gap-3 mb-4">
                   <SparklesIcon className="w-5 h-5 text-gold" />
                   <h3 className="text-xs font-black text-gold uppercase tracking-widest">Scholarly Insight</h3>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-emerald-100 leading-relaxed">
                   {analysis}
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default RecitationHub;
