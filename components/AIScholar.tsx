
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { getIslamicGuidance, decodeAudio, decodeAudioData } from '../services/geminiService';
import { ChatMessage } from '../types';
import { MalikLogo, SparklesIcon, MicIcon, SpeakerIcon, ArrowLeftIcon } from './Icons';

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Assalamu Alaikum. I am your Quran AIM Assistant. How may I help you with Islamic guidance today?", timestamp: new Date() }
  ]);
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

  const suggestions = [
    "Recite Al-Fatiha",
    "What is Zakat?",
    "Hadith on Kindness",
    "How to Pray?"
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const startLiveVoiceSession = async () => {
    setIsVoiceMode(true);
    setIsLiveActive(true);
    setLiveTranscription('Connecting...');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputNodeRef.current = audioContextRef.current.createGain();
      outputNodeRef.current.connect(audioContextRef.current.destination);
    }
    
    if (!inputAudioContextRef.current) {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setLiveTranscription('I am listening...');
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setLiveTranscription(message.serverContent.outputTranscription.text);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBytes = decode(base64Audio);
              const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current!);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current.values()) {
                s.stop();
                sourcesRef.current.delete(s);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsLiveActive(false),
          onerror: () => setIsLiveActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: "You are the Al-Malik Voice Assistant. Provide concise Islamic guidance. Be warm, professional, and cite Quran when asked.",
          outputAudioTranscription: {}
        }
      });
      
      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      setIsVoiceMode(false);
    }
  };

  const stopLiveVoiceSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    setIsVoiceMode(false);
    setIsLiveActive(false);
    setLiveTranscription('');
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await getIslamicGuidance(textToSend, messages);
      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: response.text, 
        timestamp: new Date(),
        groundingUrls: response.urls
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Forgive me, I had trouble connecting. Please try again.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  if (isVoiceMode) {
    return (
      <div className="fixed inset-0 z-[100] bg-navy-950 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 overflow-hidden">
        <button 
          onClick={stopLiveVoiceSession}
          className="absolute top-8 left-8 p-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all border border-white/5"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>

        <div className="relative mb-12">
          <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full border border-gold/20 flex items-center justify-center transition-all duration-1000 ${isLiveActive ? 'scale-105 shadow-[0_0_80px_rgba(212,175,55,0.15)]' : 'scale-100'}`}>
            <div className={`w-32 h-32 md:w-40 md:h-40 bg-gold rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isLiveActive ? 'animate-pulse' : 'opacity-40'}`}>
              <MalikLogo className="w-16 h-16 md:w-20 md:h-20 text-navy-950" />
            </div>
            {isLiveActive && <div className="absolute inset-0 border-2 border-gold/30 rounded-full animate-ping"></div>}
          </div>
        </div>

        <div className="max-w-xl space-y-4 px-4">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase">Live Scholar</h2>
          <p className="text-slate-300 font-medium text-sm md:text-lg min-h-[3rem] italic">
            {liveTranscription || "Waiting for your voice..."}
          </p>
          <div className="pt-6">
            <span className="text-[9px] font-black text-gold uppercase tracking-[0.4em] animate-pulse">Consultation Stream Active</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-120px)] bg-white dark:bg-navy-900 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-gold/10 overflow-hidden relative transition-all">
      {/* Header */}
      <div className="bg-navy-950 p-4 md:p-5 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-gold rounded-lg flex items-center justify-center text-navy-950 shadow-lg">
            <MalikLogo className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="font-black text-xs md:text-sm tracking-tight uppercase">Quran AIM Scholar</h3>
            <span className="text-[7px] text-gold font-bold uppercase tracking-widest opacity-70">Sovereign Knowledge</span>
          </div>
        </div>
        <button 
          onClick={startLiveVoiceSession}
          className="p-2.5 bg-white/5 hover:bg-gold hover:text-navy-950 rounded-lg transition-all border border-white/5 flex items-center gap-2"
        >
          <MicIcon className="w-4 h-4" />
          <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">Voice Chat</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.02),_transparent)]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[92%] md:max-w-[85%] p-4 md:p-6 rounded-2xl relative shadow-sm ${
              m.role === 'user' 
                ? 'bg-navy-800 dark:bg-navy-800 text-white rounded-tr-none' 
                : 'bg-slate-50 dark:bg-navy-900/80 text-slate-700 dark:text-slate-100 rounded-tl-none border border-gold/5'
            }`}>
              <div className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                {m.text}
              </div>
              {m.groundingUrls && m.groundingUrls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/5 flex flex-wrap gap-1.5">
                  {m.groundingUrls.map((url, idx) => (
                    <a key={idx} href={url.uri} target="_blank" rel="noopener noreferrer" className="text-[8px] px-1.5 py-0.5 bg-white/5 text-gold rounded border border-gold/10 hover:bg-gold hover:text-navy-950 transition-all font-bold">{url.title}</a>
                  ))}
                </div>
              )}
              <span className="text-[6px] mt-2 block font-black uppercase tracking-widest opacity-30 text-right">
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 dark:bg-navy-800 p-4 rounded-xl flex gap-1 items-center">
              <div className="w-1 h-1 bg-gold rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 md:p-5 bg-white dark:bg-navy-900 border-t border-gold/10">
        <div className="flex flex-wrap gap-1.5 mb-3 justify-center">
           {suggestions.map(s => (
             <button key={s} onClick={() => handleSend(s)} className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-gold rounded-full border border-transparent hover:border-gold/30 hover:text-gold transition-all">{s}</button>
           ))}
        </div>

        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your Islamic query..."
            className="flex-1 py-3 px-5 rounded-xl bg-slate-50 dark:bg-navy-800 border-none outline-none font-bold text-xs md:text-sm focus:ring-1 focus:ring-gold/30"
          />
          <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="p-3 bg-gold text-navy-950 rounded-xl hover:scale-105 disabled:opacity-50 transition-all shadow-md">
            <SparklesIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center mt-3 text-[7px] font-black text-slate-400 dark:text-gold/40 uppercase tracking-[0.2em]">Your Islamic queries only.</p>
      </div>
    </div>
  );
};

export default AIScholar;
