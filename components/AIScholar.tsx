
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getIslamicGuidance, decodeAudio, decodeAudioData } from '../services/geminiService';
import { ChatMessage } from '../types';
import { MalikLogo, SparklesIcon, MicIcon, SpeakerIcon, ArrowLeftIcon, LoginIcon, ShareIcon, CopyIcon, UndoIcon } from './Icons';

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

const AIScholar: React.FC = () => {
  const [userId, setUserId] = useState<string>(localStorage.getItem('almalik_user') || '');
  const [isLoggingIn, setIsLoggingIn] = useState(!userId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (userId) {
      const saved = localStorage.getItem(`almalik_history_${userId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        } catch (e) {
          setInitialMessage();
        }
      } else {
        setInitialMessage();
      }
    }
  }, [userId]);

  const setInitialMessage = () => {
    setMessages([{ 
      id: 'initial', 
      role: 'model', 
      text: `Assalamu Alaikum ${userId}. I am your Al-Malik AI Scholar. How may I assist you today?`, 
      timestamp: new Date() 
    }]);
  };

  useEffect(() => {
    if (userId && messages.length > 0) {
      localStorage.setItem(`almalik_history_${userId}`, JSON.stringify(messages));
    }
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, userId]);

  const resumeContexts = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();

    if (!inputAudioContextRef.current) {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (inputAudioContextRef.current.state === 'suspended') await inputAudioContextRef.current.resume();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.currentTarget as any).username.value.trim();
    if (name) {
      setUserId(name);
      localStorage.setItem('almalik_user', name);
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Disconnect from SMA Sanctuary?")) {
      localStorage.removeItem('almalik_user');
      setUserId('');
      setMessages([]);
      setIsLoggingIn(true);
      setShowAccountMenu(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Clear current session archives?")) {
      setMessages([]);
      localStorage.removeItem(`almalik_history_${userId}`);
      setInitialMessage();
      setShowAccountMenu(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input not supported in this browser.");
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => setInput(event.results[0][0].transcript);
    recognition.start();
  };

  const startLiveVoiceSession = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return alert("System Error: API_KEY is missing on Vercel.");

    setLoading(true);
    await resumeContexts();
    setIsVoiceMode(true);
    setIsLiveActive(true);
    setLiveTranscription('Connecting...');

    const ai = new GoogleGenAI({ apiKey });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setLiveTranscription('Listening...');
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) setLiveTranscription(message.serverContent.outputTranscription.text);
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current!);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => setIsLiveActive(false),
          onerror: () => setIsLiveActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
          systemInstruction: "You are Al-Malik Voice Assistant. Professional Islamic male scholar voice.",
          outputAudioTranscription: {}
        }
      });
      liveSessionRef.current = await sessionPromise;
      setLoading(false);
    } catch (err) {
      console.error("Mic error", err);
      setIsVoiceMode(false);
      setLoading(false);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading) return;
    
    if (!process.env.API_KEY) {
      alert("Missing API_KEY on Vercel.");
      return;
    }

    const newUserMsg = { id: Date.now().toString(), role: 'user' as const, text: textToSend, timestamp: new Date() };
    const updatedHistory = [...messages, newUserMsg];
    
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);
    
    try {
      const response = await getIslamicGuidance(textToSend, updatedHistory);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'model', 
        text: response.text || "I apologize, no response was generated.", 
        timestamp: new Date(), 
        groundingUrls: response.urls 
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 2).toString(), 
        role: 'model', 
        text: `Connection issues. Error: ${err.message}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (isLoggingIn) return (
    <div className="flex flex-col h-[calc(100vh-10rem)] items-center justify-center p-6">
       <div className="glass-premium p-8 md:p-12 rounded-[2.5rem] w-full max-sm shadow-2xl border border-gold/20 space-y-6 bg-white dark:bg-navy-900/50">
          <div className="text-center space-y-4">
            <LoginIcon className="w-10 h-10 text-gold mx-auto" />
            <h2 className="text-xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">Enter SMA Sanctuary</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Authenticated Web-System Access</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
             <input name="username" type="text" placeholder="Your Name" className="w-full py-4 px-6 bg-slate-50 dark:bg-navy-950 rounded-2xl font-bold focus:ring-2 focus:ring-gold outline-none text-sm border border-gold/5" required />
             <button type="submit" className="w-full py-4 bg-gold text-navy-950 font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] transition-all">ACCESS SYSTEM</button>
          </form>
       </div>
    </div>
  );

  if (isVoiceMode) return (
    <div className="fixed inset-0 z-[100] bg-navy-950 flex flex-col items-center justify-center p-6 text-center">
      <button onClick={() => { liveSessionRef.current?.close(); setIsVoiceMode(false); }} className="absolute top-8 left-8 p-3 text-white bg-white/5 rounded-xl"><ArrowLeftIcon className="w-5 h-5" /></button>
      <MalikLogo className="w-16 md:w-24 text-gold mb-12 animate-pulse" />
      <p className="text-white text-lg italic uppercase tracking-widest">{liveTranscription || "CONNECTING..."}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-10rem)] md:h-[calc(100vh-120px)] bg-white dark:bg-navy-900 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl border border-gold/10 overflow-hidden relative">
      <div className="bg-navy-950 p-2 md:p-4 text-white flex items-center justify-between shrink-0 z-50 border-b border-gold/10">
        <div className="flex items-center gap-4">
          <MalikLogo className="w-8 h-8 md:w-10 md:h-10 text-gold" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-[9px] md:text-[11px] uppercase tracking-tighter">{userId}'s Sanctuary</span>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-[7px] text-gold uppercase tracking-widest font-black opacity-60">System Online</span>
          </div>
        </div>
        
        <div className="flex gap-1.5 md:gap-3">
          <button 
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
          >
             <span className="text-[9px] font-black uppercase tracking-widest">Account</span>
             <svg className={`w-3 h-3 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={startLiveVoiceSession} title="Live Voice" className="p-2.5 bg-white/5 hover:bg-gold hover:text-navy-950 rounded-lg transition-all border border-white/5"><SpeakerIcon className="w-4 h-4" /></button>
          
          <div className="relative">
            <button 
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="sm:hidden p-2.5 bg-white/5 rounded-lg border border-white/5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            {showAccountMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-navy-900 border border-gold/20 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-[60]">
                <button onClick={() => { setIsLoggingIn(true); setShowAccountMenu(false); }} className="w-full text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-gold hover:text-navy-950 transition-colors border-b border-gold/10">Change Name</button>
                <button onClick={handleClearHistory} className="w-full text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-gold hover:text-navy-950 transition-colors border-b border-gold/10">Clear Archives</button>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors">Disconnect</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 custom-scrollbar bg-slate-50/10 dark:bg-transparent">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in`}>
            <div className={`max-w-[85%] md:max-w-[75%] p-4 md:p-6 rounded-3xl ${m.role === 'user' ? 'bg-gold text-navy-950 shadow-lg' : 'bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-100 border border-gold/10'}`}>
              <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{m.text}</div>
              {m.groundingUrls && m.groundingUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.groundingUrls.map((u, i) => <a key={i} href={u.uri} target="_blank" className="text-[8px] px-2 py-1 bg-gold/10 text-gold rounded-full border border-gold/20">{u.title}</a>)}
                </div>
              )}
            </div>
            <span className="text-[8px] font-black text-slate-400 mt-2 uppercase tracking-widest">{m.role === 'user' ? userId : 'Al-Malik Scholar'}</span>
          </div>
        ))}
        {loading && <div className="flex gap-2 p-2"><div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-100"></div><div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-200"></div></div>}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 md:p-6 bg-white dark:bg-navy-900 border-t border-gold/10">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 bg-slate-100 dark:bg-navy-800 rounded-[2rem] p-2 flex items-center shadow-inner">
            <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Consult the AI Scholar..." className="flex-1 py-3 px-6 bg-transparent border-none outline-none font-medium text-sm md:text-base resize-none max-h-40" />
            <button onClick={startVoiceInput} className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-gold'}`}><MicIcon className="w-5 h-5" /></button>
          </div>
          <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="p-4 bg-gold text-navy-950 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30"><SparklesIcon className="w-6 h-6" /></button>
        </div>
      </div>
    </div>
  );
};

export default AIScholar;
