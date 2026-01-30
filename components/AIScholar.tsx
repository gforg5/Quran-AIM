
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { getIslamicGuidance, speakGuidance, decodeAudio, decodeAudioData } from '../services/geminiService';
import { ChatMessage, ChatSession } from '../types';
import { MalikLogo, SparklesIcon, MicIcon, SpeakerIcon, TrashIcon, CopyIcon, ShareIcon, LoginIcon } from './Icons';

const AIScholar: React.FC = () => {
  const [userId, setUserId] = useState<string>(localStorage.getItem('almalik_user') || '');
  const [isLoggingIn, setIsLoggingIn] = useState(!userId);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReadingAloud, setIsReadingAloud] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'offline' | 'connecting' | 'online'>('online');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (userId) {
      const saved = localStorage.getItem(`almalik_sessions_${userId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSessions(parsed);
          if (parsed.length > 0) setActiveSessionId(parsed[0].id);
        } catch (e) {
          createNewSession();
        }
      } else {
        createNewSession();
      }
    }
  }, [userId]);

  useEffect(() => {
    if (userId && sessions.length > 0) {
      localStorage.setItem(`almalik_sessions_${userId}`, JSON.stringify(sessions));
    }
  }, [sessions, userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, loading]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Discussion',
      messages: [{ 
        id: 'init-' + Date.now(), 
        role: 'model', 
        text: "Assalamu Alaikum. I am your Al-Malik Scholar. How can I assist you with authenticated Islamic knowledge today?", 
        timestamp: new Date() 
      }],
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    if (window.innerWidth < 1024) setShowSidebar(false);
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

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setConnectionStatus('online');
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || loading) return;

    setLoading(true);
    setConnectionStatus('connecting');
    
    const userMsg: ChatMessage = { id: 'u-' + Date.now(), role: 'user', text: textToSend, timestamp: new Date() };
    
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const title = s.messages.length <= 1 ? textToSend.slice(0, 30) : s.title;
        return { ...s, title, messages: [...s.messages, userMsg], updatedAt: Date.now() };
      }
      return s;
    }));

    setInput('');
    abortControllerRef.current = new AbortController();

    try {
      const response = await getIslamicGuidance(textToSend, messages);
      const modelMsg: ChatMessage = { 
        id: 'm-' + Date.now(),
        role: 'model', 
        text: response.text, 
        timestamp: new Date(),
        groundingUrls: response.urls
      };
      
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) return { ...s, messages: [...s.messages, modelMsg], updatedAt: Date.now() };
        return s;
      }));
      setConnectionStatus('online');
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      
      setConnectionStatus('offline');
      // Silently try to recover connection for future queries while informing user
      const errorMsg: ChatMessage = { 
        id: 'err-' + Date.now(), 
        role: 'model', 
        text: "The Scholar hub is refreshing its connection for optimal service. Please re-send your message in a few seconds.", 
        timestamp: new Date() 
      };
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) return { ...s, messages: [...s.messages, errorMsg] };
        return s;
      }));
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  if (isLoggingIn) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-120px)] items-center justify-center p-6 bg-slate-50 dark:bg-navy-950/20 rounded-[2rem] border border-gold/10">
         <div className="glass-premium p-10 md:p-14 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-gold/20 space-y-8 animate-in zoom-in duration-500">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gold rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                 <LoginIcon className="w-8 h-8 text-navy-950" />
              </div>
              <h2 className="text-2xl font-black text-navy-950 dark:text-white uppercase tracking-tight">Identity</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Connect to the Scholarly Knowledge Hub</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
               <input name="username" type="text" placeholder="Your Name" className="w-full py-4 px-6 bg-slate-100 dark:bg-navy-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-gold outline-none transition-all shadow-inner" required />
               <button type="submit" className="w-full py-4 bg-gold text-navy-950 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl">Enter Sanctuary</button>
            </form>
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] md:h-[calc(100vh-120px)] bg-white dark:bg-navy-900 rounded-[2.5rem] shadow-2xl border border-gold/10 overflow-hidden relative transition-all">
      
      {/* Sidebar Archive */}
      <aside className={`absolute lg:relative z-50 w-72 h-full bg-slate-50 dark:bg-navy-950 border-r border-gold/10 flex flex-col transition-transform duration-300 shadow-2xl lg:shadow-none ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 flex items-center justify-between border-b border-gold/10">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-gold">Wisdom Archive</h3>
           <button onClick={createNewSession} className="p-2 bg-gold/10 text-gold rounded-xl hover:bg-gold/20 transition-all border border-gold/10">
             <SparklesIcon className="w-4 h-4" />
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
           {sessions.map(s => (
             <div 
               key={s.id} 
               onClick={() => { setActiveSessionId(s.id); if (window.innerWidth < 1024) setShowSidebar(false); }}
               className={`p-4 rounded-2xl cursor-pointer transition-all border group relative ${activeSessionId === s.id ? 'bg-gold text-navy-950 border-gold shadow-lg' : 'bg-white dark:bg-navy-900/40 text-slate-500 border-transparent hover:border-gold/30'}`}
             >
               <p className="text-xs font-black truncate pr-6">{s.title}</p>
               <span className="text-[8px] opacity-60 uppercase tracking-widest">{new Date(s.updatedAt).toLocaleDateString()}</span>
             </div>
           ))}
        </div>
      </aside>

      {/* Main Stream */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-navy-950 p-4 md:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden p-2 text-gold">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            </button>
            <div className="w-10 h-10 bg-gold rounded-2xl flex items-center justify-center text-navy-950 shadow-lg">
              <MalikLogo className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xs md:text-sm tracking-tight uppercase text-white truncate max-w-[120px]">{activeSession?.title || 'Scholar Hub'}</h3>
              <div className="flex items-center gap-1.5">
                 <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : connectionStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                 <span className="text-[7px] text-gold font-bold uppercase tracking-widest opacity-70">
                    {connectionStatus === 'connecting' ? 'Consulting Traditions...' : connectionStatus === 'online' ? 'Scholar Online' : 'Secure Refresh Active'}
                 </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {loading && (
              <button onClick={stopGeneration} className="p-2.5 px-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 text-[9px] font-black uppercase tracking-widest">
                Stop
              </button>
            )}
            <button onClick={createNewSession} className="hidden sm:flex p-2.5 px-4 bg-white/5 hover:bg-gold hover:text-navy-950 text-white rounded-xl transition-all border border-white/5 items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">New Session</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 custom-scrollbar bg-slate-50/10 dark:bg-transparent">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 group`}>
              <div className={`max-w-[95%] md:max-w-[85%] p-6 md:p-8 rounded-[2rem] relative shadow-sm ${
                m.role === 'user' ? 'bg-navy-800 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-navy-900/60 text-slate-800 dark:text-slate-100 rounded-tl-none border border-gold/5'
              }`}>
                <div className="text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 dark:bg-navy-800 p-5 rounded-2xl flex gap-2 items-center border border-gold/5">
                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 md:p-8 border-t border-gold/10 bg-white dark:bg-navy-900 shadow-2xl z-20">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <input
              type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for guidance..."
              className="flex-1 py-4 px-6 rounded-2xl bg-slate-50 dark:bg-navy-800 border-none outline-none font-bold text-sm md:text-base focus:ring-2 focus:ring-gold/30 shadow-inner"
            />
            <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="p-4 bg-gold text-navy-950 rounded-2xl hover:scale-105 disabled:opacity-50 transition-all shadow-xl active:scale-95">
              <SparklesIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIScholar;
