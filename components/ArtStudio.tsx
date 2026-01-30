
import React, { useState, useRef, useEffect } from 'react';
import { generateIslamicArt, editIslamicImage } from '../services/geminiService';
import { MalikLogo, SparklesIcon, UndoIcon, RedoIcon } from './Icons';

const ArtStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing Neural Ink...');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  
  // History management for Undo/Redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatios = [
    { label: "1:1 Square", value: "1:1" },
    { label: "16:9 Wide", value: "16:9" },
    { label: "9:16 Tall", value: "9:16" },
    { label: "4:3 Classic", value: "4:3" },
  ];

  const loadingSteps = [
    "Assembling Geometric Foundations...",
    "Infusing Celestial Illumination...",
    "Manifesting Kufic Patterns...",
    "Polishing Sovereign Pixels...",
    "Finalizing Divine Vision..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      let step = 0;
      interval = setInterval(() => {
        setLoadingStatus(loadingSteps[step % loadingSteps.length]);
        step++;
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const pushToHistory = (url: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(url);
    // Limit history to 20 states to prevent memory issues
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setImageUrl(url);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setImageUrl(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setImageUrl(history[historyIndex + 1]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setLoadingStatus(loadingSteps[0]);
    setError(null);
    try {
      const url = await generateIslamicArt(prompt, aspectRatio);
      pushToHistory(url);
      
      // Auto-save to gallery
      const gallery = JSON.parse(localStorage.getItem('almalik_gallery') || '[]');
      gallery.unshift({ id: Date.now().toString(), url, prompt, timestamp: new Date() });
      localStorage.setItem('almalik_gallery', JSON.stringify(gallery));
      
    } catch (err) {
      setError("The neural ink failed to materialize. Please try another divine prompt.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt || !imageUrl) return;
    setLoading(true);
    setLoadingStatus('Analyzing Original Scroll...');
    setError(null);
    try {
      const url = await editIslamicImage(imageUrl, prompt, aspectRatio);
      pushToHistory(url);
    } catch (err) {
      setError("Transformation failed. Authenticate your vision and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setImageUrl(url);
        setHistory([url]);
        setHistoryIndex(0);
        setMode('edit');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-12 animate-in slide-in-from-bottom duration-700">
      <header className="text-center space-y-2 lg:space-y-4">
        <h2 className="text-2xl lg:text-4xl font-black text-emerald-950 dark:text-white tracking-tighter uppercase">Sacred <span className="text-gradient-gold">Art</span> Studio</h2>
        <p className="text-xs lg:text-sm text-slate-500 dark:text-emerald-400 font-medium px-4">Manifesting the beauty of the Unseen through neural calligraphy and geometry.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
        <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
           <div className="glass-premium p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] border border-gold/10 shadow-2xl space-y-6 lg:space-y-8">
              <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-emerald-950 rounded-2xl">
                <button
                  onClick={() => setMode('generate')}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'generate' ? 'bg-gold text-emerald-950 shadow-lg' : 'text-slate-500'}`}
                >
                  Create Anew
                </button>
                <button
                  onClick={() => setMode('edit')}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'edit' ? 'bg-gold text-emerald-950 shadow-lg' : 'text-slate-500'}`}
                >
                  Transform Scroll
                </button>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center px-2">
                   <label className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Canvas Profile</label>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                   {aspectRatios.map((ratio) => (
                     <button
                       key={ratio.value}
                       onClick={() => setAspectRatio(ratio.value)}
                       className={`py-2 px-3 rounded-xl text-[9px] font-bold border transition-all ${aspectRatio === ratio.value ? 'bg-emerald-950 text-gold border-gold' : 'bg-slate-50 dark:bg-royal-dark border-transparent text-slate-500 dark:text-slate-400'}`}
                     >
                       {ratio.label}
                     </button>
                   ))}
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center px-2">
                   <label className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">Vision Prompt</label>
                   <SparklesIcon className="w-4 h-4 text-gold animate-pulse" />
                 </div>
                 <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={mode === 'generate' ? "e.g., A celestial nebula in the shape of traditional Kufic calligraphy, golden outlines, hyper-realistic..." : "e.g., Change the geometry to deep emerald silk and add shimmering golden light..."}
                    className="w-full h-32 lg:h-40 p-5 lg:p-6 bg-slate-50 dark:bg-royal-dark border-none rounded-[1.5rem] lg:rounded-[2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-gold/10 transition-all resize-none shadow-inner"
                 />
              </div>

              <button 
                onClick={mode === 'generate' ? handleGenerate : handleEdit}
                disabled={loading || !prompt}
                className="w-full py-4 lg:py-5 bg-emerald-950 dark:bg-gold text-white dark:text-emerald-950 font-black uppercase tracking-widest text-[10px] lg:text-xs rounded-2xl hover:scale-[1.02] transition-all shadow-2xl disabled:opacity-50"
              >
                {loading ? 'Consulting the Void...' : 'Execute Divine Vision'}
              </button>
              
              {error && (
                <p className="text-[10px] text-red-500 font-bold text-center animate-pulse">{error}</p>
              )}
           </div>
           
           <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {[
                { label: 'Royal Kufic', prompt: 'Masterpiece of Royal Kufic Calligraphy, intricate gold leaf on black velvet, divine luminescence, 8K resolution.' },
                { label: 'Celestial Alhambra', prompt: 'Moorish architectural geometry inspired by Alhambra, celestial night sky background, emerald and gold palette.' },
                { label: 'Sacred Mosaic', prompt: 'Complex Islamic geometric mosaic pattern, interlocking stars, translucent sapphire and amber tiles, 4K professional art.' },
                { label: 'Prophetic Light', prompt: 'Conceptual visualization of Prophetic wisdom as a beam of crystalline light passing through an ornate silver archway.' }
              ].map(tpl => (
                <button 
                  key={tpl.label}
                  onClick={() => setPrompt(tpl.prompt)}
                  className="p-3 lg:p-4 rounded-2xl bg-white dark:bg-emerald-950/40 border border-gold/5 text-[9px] font-black text-slate-500 dark:text-emerald-500 uppercase tracking-widest hover:border-gold hover:text-gold transition-all text-left group"
                >
                  <span className="group-hover:text-gold transition-colors">+ {tpl.label}</span>
                </button>
              ))}
           </div>
        </div>

        <div className="space-y-4 lg:space-y-6 order-1 lg:order-2">
          <div className="relative glass-premium rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden border-4 border-gold/20 shadow-2xl group flex items-center justify-center bg-slate-50 dark:bg-royal-dark min-h-[300px] lg:min-h-0" style={{ aspectRatio: aspectRatio.replace(':', '/') }}>
             {imageUrl ? (
               <img src={imageUrl} className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-[1.02]" />
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 lg:p-12 gap-4 lg:gap-8">
                  <MalikLogo className="w-16 h-16 lg:w-24 text-gold/10 animate-sacred-glow" />
                  <div className="space-y-2">
                    <p className="text-lg lg:text-xl font-black text-emerald-950 dark:text-white uppercase tracking-tighter">Artistic Void</p>
                    <p className="text-[10px] lg:text-xs font-medium text-slate-400 px-6">Your visionary creation will manifest here from the ether.</p>
                  </div>
                  {mode === 'edit' && (
                    <button onClick={() => fileInputRef.current?.click()} className="text-gold font-black uppercase tracking-widest text-[10px] hover:underline">
                      Upload Scroll
                    </button>
                  )}
               </div>
             )}
             
             {loading && (
               <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xl flex flex-col items-center justify-center z-20 animate-in fade-in">
                  <div className="relative">
                    <div className="w-16 h-16 lg:w-24 lg:h-24 border-t-4 border-gold rounded-full animate-spin shadow-[0_0_50px_rgba(212,175,55,0.5)]"></div>
                    <MalikLogo className="w-8 h-8 lg:w-10 lg:h-10 text-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-sacred-glow" />
                  </div>
                  <div className="mt-8 text-center space-y-3 px-6">
                    <p className="text-gold font-black uppercase tracking-[0.4em] text-[10px] lg:text-xs animate-pulse">{loadingStatus}</p>
                    <div className="w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                       <div className="h-full bg-gold animate-[loading_4s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
               </div>
             )}
             <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
          </div>

          <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 glass-premium rounded-[1.5rem] lg:rounded-[2rem] border border-gold/10">
            <div className="flex gap-2 lg:gap-4">
               <button 
                onClick={undo}
                disabled={historyIndex <= 0 || loading}
                className="p-2 lg:p-3 bg-white dark:bg-emerald-950 rounded-xl text-slate-400 dark:text-emerald-500 hover:text-gold disabled:opacity-20 transition-all border border-gold/5"
                title="Undo"
               >
                 <UndoIcon className="w-4 h-4 lg:w-5 lg:h-5" />
               </button>
               <button 
                onClick={redo}
                disabled={historyIndex >= history.length - 1 || loading}
                className="p-2 lg:p-3 bg-white dark:bg-emerald-950 rounded-xl text-slate-400 dark:text-emerald-500 hover:text-gold disabled:opacity-20 transition-all border border-gold/5"
                title="Redo"
               >
                 <RedoIcon className="w-4 h-4 lg:w-5 lg:h-5" />
               </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 lg:p-3 bg-gold/10 rounded-xl text-gold border border-gold/20 hover:bg-gold/20 transition-all"
                title="Upload"
              >
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </button>
              <div className="text-[9px] font-black text-slate-400 dark:text-emerald-500 uppercase tracking-widest hidden sm:block">
                Archive Phase {historyIndex + 1}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ArtStudio;