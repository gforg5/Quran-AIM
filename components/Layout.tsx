
import React, { useState, useEffect } from 'react';
import { AppTab } from '../types';
import { BayanLogo, QuranIcon, HadithIcon, SparklesIcon } from './Icons';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-navy-950 transition-colors duration-500 overflow-hidden">
      {/* Professional Sidebar Navigation */}
      <nav className="w-full md:w-20 bg-slate-50 dark:bg-navy-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-row md:flex-col items-center py-2 md:py-6 px-4 md:px-0 z-50 sticky top-0 md:h-screen shrink-0 shadow-sm md:shadow-none">
        
        {/* Brand Section */}
        <div className="flex md:flex-col items-center justify-center md:mb-8">
          <BayanLogo 
            className="w-10 h-10 text-gold hover:scale-105 transition-all cursor-pointer" 
            onClick={() => setActiveTab(AppTab.QURAN)} 
          />
        </div>

        {/* Primary Navigation Group */}
        <div className="flex flex-row md:flex-col items-center gap-2 md:gap-3 flex-1 md:flex-none md:w-full justify-center md:justify-start">
          <button
            onClick={() => setActiveTab(AppTab.QURAN)}
            className={`p-3 rounded-xl transition-all relative group ${
              activeTab === AppTab.QURAN 
                ? 'bg-gold text-white shadow-lg scale-110' 
                : 'text-slate-400 hover:text-gold hover:bg-gold/5'
            }`}
          >
            <QuranIcon className="w-5 h-5" />
            <span className="hidden md:block absolute left-full ml-4 px-3 py-1 bg-navy-800 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-slate-700 whitespace-nowrap">
              Al-Quran
            </span>
          </button>

          <button
            onClick={() => setActiveTab(AppTab.HADITH)}
            className={`p-3 rounded-xl transition-all relative group ${
              activeTab === AppTab.HADITH 
                ? 'bg-gold text-white shadow-lg scale-110' 
                : 'text-slate-400 hover:text-gold hover:bg-gold/5'
            }`}
          >
            <HadithIcon className="w-5 h-5" />
            <span className="hidden md:block absolute left-full ml-4 px-3 py-1 bg-navy-800 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-slate-700 whitespace-nowrap">
              Hadith
            </span>
          </button>

          <button 
            onClick={() => setActiveTab(AppTab.QURAN_AI)}
            className={`p-3 rounded-xl transition-all relative group ${
              activeTab === AppTab.QURAN_AI 
                ? 'bg-navy-800 dark:bg-gold text-white dark:text-navy-950 shadow-lg scale-110' 
                : 'text-slate-400 hover:text-gold hover:bg-gold/5'
            }`}
          >
            <SparklesIcon className="w-5 h-5" />
            <span className="hidden md:block absolute left-full ml-4 px-3 py-1 bg-navy-800 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-slate-700 whitespace-nowrap">
              AI Scholar
            </span>
          </button>

          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-3 flex items-center justify-center rounded-xl bg-slate-200/50 dark:bg-navy-800/50 text-slate-500 dark:text-gold hover:scale-110 transition-all shadow-sm"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.344l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
        
        {/* Simple Label at Bottom */}
        <div className="hidden md:flex flex-col items-center mt-auto opacity-30 pb-4">
          <p className="[writing-mode:vertical-lr] text-[8px] font-black uppercase tracking-[0.5em] text-slate-500">Al-Malik</p>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md shrink-0 z-40">
          <div className="flex items-center gap-4 overflow-hidden">
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gold cursor-pointer shrink-0" onClick={() => setActiveTab(AppTab.QURAN)}>Al-Malik</span>
             <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full shrink-0"></div>
             <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 truncate">
              {activeTab === AppTab.QURAN ? 'Holy Quran' : 
               activeTab === AppTab.HADITH ? 'Hadith Vault' :
               activeTab === AppTab.DEVELOPER ? 'SMA' : 
               activeTab === AppTab.QURAN_AI ? 'AI Assistant' : 'About'}
             </h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <button 
              onClick={() => setActiveTab(AppTab.DEVELOPER)}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === AppTab.DEVELOPER ? 'text-gold' : 'text-slate-500 hover:text-gold'}`}
            >
              SMA
            </button>
            <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-800"></div>
            <button 
              onClick={() => setActiveTab(AppTab.ABOUT)}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === AppTab.ABOUT ? 'text-gold' : 'text-slate-500 hover:text-gold'}`}
            >
              About
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/20 dark:bg-transparent transition-colors duration-500">
          <div className="max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
