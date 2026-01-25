
import React, { useState, useRef } from 'react';
import { speakGuidance, decodeAudio, decodeAudioData } from '../services/geminiService';
import { MicIcon, SpeakerIcon, MalikLogo } from './Icons';

const VoiceScholar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSpeak = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setIsPlaying(true);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const base64 = await speakGuidance(query);
      const audioBytes = decodeAudio(base64);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setIsPlaying(false);
        setLoading(false);
      };
      source.start();
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in duration-1000">
      <div className={`relative w-64 h-64 flex items-center justify-center transition-all duration-700 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
        <div className={`absolute inset-0 rounded-full border-[10px] border-gold/10 transition-all ${isPlaying ? 'animate-spin-slow border-gold/30' : ''}`}></div>
        <div className={`absolute inset-4 rounded-full border-4 border-dashed border-gold/20 transition-all ${isPlaying ? 'animate-pulse' : ''}`}></div>
        <div className="relative w-48 h-48 bg-emerald-950 rounded-full shadow-[0_0_50px_rgba(212,175,55,0.4)] flex items-center justify-center overflow-hidden group">
           <MalikLogo className={`w-24 h-24 text-gold ${isPlaying ? 'animate-float' : ''}`} />
           {isPlaying && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-1 bg-gold/30 absolute animate-pulse"></div>
             </div>
           )}
        </div>
      </div>

      <div className="space-y-6 max-w-2xl px-6">
        <h2 className="text-5xl font-black text-emerald-950 dark:text-white tracking-tighter">The <span className="text-gradient-gold">Voice</span> of Wisdom</h2>
        <p className="text-slate-500 dark:text-emerald-400 font-medium text-lg leading-relaxed">
          Ask any question regarding faith, ethics, or law. Our AI Scholar will respond with an authenticated voice of knowledge.
        </p>
      </div>

      <div className="w-full glass-premium p-10 rounded-[3rem] shadow-2xl space-y-6">
        <div className="relative">
          <textarea 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Explain the importance of patience in Islam..."
            className="w-full bg-slate-50 dark:bg-emerald-950/50 border-none rounded-[2rem] p-8 text-lg font-bold outline-none focus:ring-4 focus:ring-gold/20 transition-all min-h-[150px] resize-none"
          />
          <div className="absolute bottom-4 right-4 flex gap-4">
            <button 
              onClick={handleSpeak}
              disabled={loading || !query.trim()}
              className="p-6 bg-gold text-emerald-950 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <div className="w-8 h-8 border-4 border-emerald-950/20 border-t-emerald-950 rounded-full animate-spin"></div>
              ) : (
                <MicIcon className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6">
           <span className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Model: Gemini 2.5 Flash Voice</span>
           <div className="w-1 h-1 bg-gold rounded-full"></div>
           <span className="text-[10px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest">Voice: Kore Professional</span>
        </div>
      </div>
    </div>
  );
};

export default VoiceScholar;
