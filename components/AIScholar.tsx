
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MalikLogo, SparklesIcon, MicIcon, SpeakerIcon, TrashIcon, LoginIcon } from './Icons';

// Manual encoding/decoding as required by guidelines
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

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AIScholar: React.FC = () => {
  const [isLive, setIsLive] = useState(false);
  const [status, setStatus] = useState('Scholar Offline');
  const [transcriptions, setTranscriptions] = useState<{role: string, text: string}[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sources = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTime = useRef(0);

  const startVoiceChat = async () => {
    if (isLive) return stopVoiceChat();
    
    setIsLive(true);
    setStatus('Connecting...');
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputAudioContext;

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: async () => {
          setStatus('Scholar Live');
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          inputAudioContextRef.current = inputCtx;
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            const pcmBlob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const base64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64) {
            nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64), outputAudioContext, 24000, 1);
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.start(nextStartTime.current);
            nextStartTime.current += audioBuffer.duration;
            sources.current.add(source);
            source.onended = () => sources.current.delete(source);
          }
          
          if (message.serverContent?.interrupted) {
            sources.current.forEach(s => s.stop());
            sources.current.clear();
            nextStartTime.current = 0;
          }
        },
        onclose: () => {
          setStatus('Scholar Offline');
          setIsLive(false);
        },
        onerror: (e) => {
          console.error(e);
          setStatus('Connection Lost');
          setIsLive(false);
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: 'You are Al-Malik Scholar AI. Respond concisely and professionally with authenticated Islamic knowledge via voice.'
      }
    });
    sessionRef.current = sessionPromise;
  };

  const stopVoiceChat = async () => {
    if (sessionRef.current) {
      const session = await sessionRef.current;
      session.close();
    }
    inputAudioContextRef.current?.close();
    audioContextRef.current?.close();
    setIsLive(false);
    setStatus('Scholar Offline');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-120px)] bg-white dark:bg-navy-900 rounded-[2rem] shadow-xl border border-gold/10 overflow-hidden relative">
      <header className="bg-navy-950 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-navy-950 ${isLive ? 'animate-pulse' : ''}`}>
            <MalikLogo className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white text-xs font-black uppercase tracking-widest">Scholar Voice</h3>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
              <span className="text-[7px] text-gold font-bold uppercase tracking-widest">{status}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 bg-gradient-to-b from-transparent to-slate-50 dark:to-navy-950/20">
         <div className={`relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center transition-all ${isLive ? 'scale-110' : 'scale-100'}`}>
            <div className={`absolute inset-0 rounded-full border-[10px] border-gold/10 transition-all ${isLive ? 'animate-spin-slow border-gold/40' : ''}`}></div>
            <div className={`absolute inset-4 rounded-full border-2 border-dashed border-gold/20 transition-all ${isLive ? 'animate-pulse' : ''}`}></div>
            <div className="relative w-32 h-32 md:w-44 md:h-44 bg-navy-900 rounded-full flex items-center justify-center shadow-2xl">
               <div className={`flex gap-1 items-end h-8 md:h-12 ${!isLive ? 'opacity-20' : ''}`}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-1.5 md:w-2 bg-gold rounded-full ${isLive ? 'animate-bounce' : ''}`} style={{ animationDelay: `${i * 0.1}s`, height: isLive ? `${30 + Math.random() * 70}%` : '10%' }}></div>
                  ))}
               </div>
            </div>
         </div>

         <div className="max-w-xs space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-navy-950 dark:text-white uppercase tracking-tight">Real-time Discussion</h2>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium leading-relaxed">Tap to start an authenticated voice conversation with the AI Scholar.</p>
         </div>

         <button 
           onClick={startVoiceChat}
           className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 ${isLive ? 'bg-red-500 text-white' : 'bg-gold text-navy-950'}`}
         >
           {isLive ? (
             <div className="w-5 h-5 bg-white rounded-sm"></div>
           ) : (
             <MicIcon className="w-8 h-8" />
           )}
         </button>
      </div>

      <div className="p-4 bg-slate-50/50 dark:bg-navy-800/50 border-t border-gold/10 text-center">
         <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-400">GPT-Mode: Real-time Voice Encryption Active</span>
      </div>
    </div>
  );
};

export default AIScholar;
