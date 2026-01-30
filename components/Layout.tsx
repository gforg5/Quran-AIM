
import React, { useState, useEffect } from 'react';
import { AppTab } from '../types';
import { BayanLogo, QuranIcon, HadithIcon, SparklesIcon, UserIcon, InfoIcon } from './Icons';

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
      {/* Sidebar Navigation (Desktop) */}
      <nav className="hidden md:flex w-20 bg-slate-50 dark:bg-navy-900 border-r border-slate-200 dark:border-slate-800 flex-col items-center py-6 z-50 h-screen shrink-0">
        <div className="mb-8">
          <BayanLogo 
            className="w-10 h-10 text-gold hover:scale-110 transition-all cursor-pointer" 
            onClick={() => setActiveTab(AppTab.QURAN)} 
          />
        </div>

        <div className="flex flex-col items-center gap-3 w-full">
          {[
            { id: AppTab.QURAN, icon: QuranIcon, label: 'Quran' },
            { id: AppTab.HADITH, icon: HadithIcon, label: 'Hadith' },
            { id: AppTab.QURAN_AI, icon: SparklesIcon, label: 'Scholar' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-2xl transition-all relative group ${
                activeTab === item.id 
                  ? 'bg-gold text-white shadow-lg scale-110' 
                  : 'text-slate-400 hover:text-gold hover:bg-gold/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}

          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-3 flex items-center justify-center rounded-2xl bg-slate-200/50 dark:bg-navy-800/50 text-slate-500 dark:text-gold hover:scale-110 transition-all shadow-sm mt-4"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364 6.364l-.707-.707M6.343 6.344l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        {/* Responsive Header with Rounded Square Icons */}
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-10 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-navy-950/90 backdrop-blur-xl shrink-0 z-40">
          <div className="flex items-center gap-3">
             <BayanLogo className="w-8 h-8 text-gold md:w-10 md:h-10 animate-in zoom-in" />
             <div className="flex flex-col justify-center">
               <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gold leading-none">Al-Malik</span>
               <h1 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400 hidden sm:block">
                {activeTab === AppTab.QURAN ? 'Quran' : 
                 activeTab === AppTab.HADITH ? 'Hadith' :
                 activeTab === AppTab.DEVELOPER ? 'Admin' : 
                 activeTab === AppTab.QURAN_AI ? 'Scholar AI' : 'About'}
               </h1>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab(AppTab.DEVELOPER)}
              className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl border transition-all active:scale-95 animate-in zoom-in duration-300 ${
                activeTab === AppTab.DEVELOPER 
                  ? 'bg-gold border-gold text-white shadow-xl' 
                  : 'bg-slate-50 dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-gold'
              }`}
            >
              <UserIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button 
              onClick={() => setActiveTab(AppTab.ABOUT)}
              className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl border transition-all active:scale-95 animate-in zoom-in duration-300 delay-75 ${
                activeTab === AppTab.ABOUT 
                  ? 'bg-gold border-gold text-white shadow-xl' 
                  : 'bg-slate-50 dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-gold'
              }`}
            >
              <InfoIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </header>

        {/* Mobile Fixed Navigation */}
        <nav className="md:hidden h-16 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around shrink-0 z-40">
           {[
             { id: AppTab.QURAN, icon: QuranIcon },
             { id: AppTab.HADITH, icon: HadithIcon },
             { id: AppTab.QURAN_AI, icon: SparklesIcon },
           ].map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
                 activeTab === item.id 
                   ? 'bg-gold text-white shadow-xl scale-110' 
                   : 'text-slate-400'
               }`}
             >
               <item.icon className="w-6 h-6" />
             </button>
           ))}
        </nav>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/10 dark:bg-transparent">
          <div className="max-w-7xl mx-auto w-full p-4 md:p-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
