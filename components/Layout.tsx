
import React, { useState, useEffect } from 'react';
import { AppTab } from '../types';
import { BayanLogo, QuranIcon, HadithIcon, SparklesIcon, ToolsIcon, MalikLogo, CreditCardIcon } from './Icons';

interface LayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  goHome: () => void;
  showDashboard: boolean;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, goHome, showDashboard, children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const isTabActive = (tab: AppTab) => !showDashboard && activeTab === tab;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-navy-950 transition-colors duration-500 overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-20 bg-slate-50 dark:bg-navy-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-row md:flex-col items-center py-2 md:py-6 px-4 md:px-0 z-50 sticky top-0 md:h-screen shrink-0 shadow-sm md:shadow-none">
        
        <div className="flex md:flex-col items-center justify-center md:mb-8">
          <BayanLogo 
            className={`w-8 h-8 md:w-10 md:h-10 hover:scale-105 transition-all cursor-pointer ${showDashboard ? 'text-gold' : 'text-slate-400'}`} 
            onClick={goHome} 
          />
        </div>

        <div className="flex flex-row md:flex-col items-center gap-1 md:gap-3 flex-1 md:flex-none md:w-full justify-around md:justify-start px-2 md:px-0">
          <button
            onClick={() => setActiveTab(AppTab.QURAN)}
            title="Holy Quran"
            className={`p-2 md:p-3 rounded-xl transition-all ${isTabActive(AppTab.QURAN) ? 'bg-gold text-white' : 'text-slate-400 hover:text-gold'}`}
          >
            <QuranIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button
            onClick={() => setActiveTab(AppTab.HADITH)}
            title="Hadith Vault"
            className={`p-2 md:p-3 rounded-xl transition-all ${isTabActive(AppTab.HADITH) ? 'bg-gold text-white' : 'text-slate-400 hover:text-gold'}`}
          >
            <HadithIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button 
            onClick={() => setActiveTab(AppTab.SYSTEMS_DEVELOPMENT)}
            title="Systems Development AI"
            className={`p-2 md:p-3 rounded-xl transition-all ${isTabActive(AppTab.SYSTEMS_DEVELOPMENT) ? 'bg-gold text-white' : 'text-slate-400 hover:text-gold'}`}
          >
            <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <button 
            onClick={() => setActiveTab(AppTab.TOOLS)}
            title="Explore"
            className={`p-2 md:p-3 rounded-xl transition-all ${isTabActive(AppTab.TOOLS) ? 'bg-gold text-white' : 'text-slate-400 hover:text-gold'}`}
          >
            <ToolsIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button 
            onClick={() => setActiveTab(AppTab.SADAQAH)}
            title="Sadaqah & Payments"
            className={`p-2 md:p-3 rounded-xl transition-all ${isTabActive(AppTab.SADAQAH) ? 'bg-gold text-white' : 'text-slate-400 hover:text-gold'}`}
          >
            <CreditCardIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 flex items-center justify-center rounded-xl bg-slate-200/50 dark:bg-navy-800/50 text-slate-500 dark:text-gold"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.344l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md shrink-0 z-40">
          <div className="flex items-center gap-2 overflow-hidden">
             <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-gold cursor-pointer" onClick={goHome}>AL-MALIK</span>
             <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
             <h1 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 truncate">
              {showDashboard ? 'Sovereign Wisdom' : (
                activeTab === AppTab.QURAN ? 'Holy Quran' : 
                activeTab === AppTab.HADITH ? 'Hadith (حدیث)' :
                activeTab === AppTab.DEVELOPER ? 'SMA' : 
                activeTab === AppTab.ABOUT ? 'About' :
                activeTab === AppTab.SYSTEMS_DEVELOPMENT ? 'Systems Development' : 
                activeTab === AppTab.SADAQAH ? 'Sadaqah' : 
                activeTab === AppTab.TOOLS ? 'Explore' : 'About'
              )}
             </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab(AppTab.DEVELOPER)} className={`text-[9px] font-black uppercase tracking-[0.2em] ${activeTab === AppTab.DEVELOPER && !showDashboard ? 'text-gold' : 'text-slate-500'}`}>SMA</button>
            <button onClick={() => setActiveTab(AppTab.ABOUT)} className={`text-[9px] font-black uppercase tracking-[0.2em] ${activeTab === AppTab.ABOUT && !showDashboard ? 'text-gold' : 'text-slate-500'}`}>About</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/20 dark:bg-transparent">
          <div className="p-4 md:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
