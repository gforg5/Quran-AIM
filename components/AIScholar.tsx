
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getIslamicGuidance, decodeAudio, decodeAudioData } from '../services/geminiService';
import { ChatMessage } from '../types';
import { MalikLogo, SparklesIcon, MicIcon, SpeakerIcon, ArrowLeftIcon, TrashIcon, CopyIcon, ShareIcon, LoginIcon } from './Icons';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
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
          setMessages([]);
        }
      } else {
        setMessages([{ 
          id: 'initial', 
          role: 'model', 
          text: `Assalamu Alaikum ${userId}. I am your Al-Malik Scholar. How may I assist you today?`, 
          timestamp: new Date() 
        }]);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (userId && messages.length > 0) {
      localStorage.setItem(`almalik_history_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = (e.currentTarget as any).username.value.trim();
    if (name) {
      setUserId(name);
      localStorage.setItem('almalik_user', name);
      setIsLoggingIn(false);
    }
  };

  const startLiveVoiceSession = async () => {
    // Critical for Mobile: AudioContext must be resumed on user gesture
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

    setIsVoiceMode(true);
    setIsLiveActive(true);
    setLiveTranscription('Connecting...');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setLiveTranscription('Listening to your wisdom...');
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
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsLiveActive(false),
          onerror: () => setIsLiveActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: "You are the Al-Malik Voice Assistant. Concise and professional Islamic guidance.",
          outputAudioTranscription: {}
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Mic error", err);
      setIsVoiceMode(false);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: textToSend, timestamp: new Date() }]);
    setInput('');
    setLoading(true);
    try {
      const response = await getIslamicGuidance(textToSend, messages);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        role: 'model', text: response.text || "I apologize, the stream is silent. Please try again.", 
        timestamp: new Date(), groundingUrls: response.urls 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Connection issues. Please retry.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  if (isLoggingIn) return (
    <div className="flex flex-col h-[calc(100vh-10rem)] items-center justify-center p-6 px-2">
       <div className="glass-premium p-8 md:p-12 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-gold/20 space-y-8">
          <div className="text-center space-y-4">
            <LoginIcon className="w-12 h-12 text-gold mx-auto" />
            <h2 className="text-xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">Scholarly Identity</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
             <input name="username" type="text" placeholder="Your Name" className="w-full py-4 px-6 bg-slate-50 dark:bg-navy-900 rounded-2xl font-bold focus:ring-2 focus:ring-gold outline-none" required />
             <button type="submit" className="w-full py-4 bg-gold text-navy-950 font-black rounded-2xl uppercase tracking-widest text-[10px]">Enter Sanctuary</button>
          </form>
       </div>
    </div>
  );

  if (isVoiceMode) return (
    <div className="fixed inset-0 z-[100] bg-navy-950 flex flex-col items-center justify-center p-6 text-center">
      <button onClick={() => { liveSessionRef.current?.close(); setIsVoiceMode(false); }} className="absolute top-8 left-8 p-3 text-white bg-white/5 rounded-xl"><ArrowLeftIcon className="w-5 h-5" /></button>
      <div className="relative mb-12">
        <div className={`w-40 h-40 md:w-64 md:h-64 rounded-full border border-gold/20 flex items-center justify-center ${isLiveActive ? 'animate-pulse' : ''}`}>
          <MalikLogo className="w-16 md:w-24 text-gold" />
        </div>
      </div>
      <p className="text-white text-lg italic px-4">{liveTranscription || "Listening..."}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-120px)] bg-white dark:bg-navy-900 rounded-[2.5rem] shadow-2xl border border-gold/10 overflow-hidden">
      <div className="bg-navy-950 p-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center text-navy-950" onClick={() => setUserId('')}>
            <MalikLogo className="w-6 h-6" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest">{userId}'s Vault</span>
        </div>
        <button onClick={startLiveVoiceSession} className="p-2.5 bg-white/5 hover:bg-gold hover:text-navy-950 rounded-lg transition-all border border-white/5">
           <MicIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
            <div className={`max-w-[90%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-navy-800 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-navy-900 text-slate-700 dark:text-slate-100 rounded-tl-none border border-gold/5'}`}>
              <div className="text-xs md:text-sm leading-relaxed">{m.text}</div>
              {m.groundingUrls && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.groundingUrls.map((u, i) => <a key={i} href={u.uri} target="_blank" className="text-[8px] px-1.5 py-0.5 bg-gold/10 text-gold rounded border border-gold/20">{u.title}</a>)}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && <div className="flex gap-1 p-4"><div className="w-1 h-1 bg-gold rounded-full animate-bounce"></div><div className="w-1 h-1 bg-gold rounded-full animate-bounce delay-75"></div></div>}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white dark:bg-navy-900 border-t border-gold/10">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask the Scholar..." className="flex-1 py-3 px-5 rounded-xl bg-slate-50 dark:bg-navy-800 border-none outline-none font-bold text-xs" />
          <button onClick={() => handleSend()} className="p-3 bg-gold text-navy-950 rounded-xl"><SparklesIcon className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

export default AIScholar;
