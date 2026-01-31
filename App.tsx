
import React, { useState } from 'react';
import Layout from './components/Layout';
import QuranExplorer from './components/QuranExplorer';
import HadithVault from './components/HadithVault';
import Developer from './components/Developer';
import About from './components/About';
import AIScholar from './components/AIScholar';
import Library from './components/Library';
import Tools from './components/Tools';
import ArtStudio from './components/ArtStudio';
import Dashboard from './components/Dashboard';
import Sadaqah from './components/Sadaqah';
import { AppTab, ActiveAudio } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.QURAN);
  const [showDashboard, setShowDashboard] = useState(true);
  const [activeAudio, setActiveAudio] = useState<ActiveAudio | null>(null);

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    setShowDashboard(false);
  };

  const stopAudioGlobal = () => {
    setActiveAudio(null);
    // This will trigger re-renders in components that observe activeAudio
    // Real stopping logic is handled via useEffects in child components 
    // but the UI bar reacts to this state.
    window.dispatchEvent(new CustomEvent('almalik_stop_audio'));
  };

  const renderContent = () => {
    if (showDashboard) return <Dashboard setActiveTab={handleTabChange} onAudioStateChange={setActiveAudio} activeAudio={activeAudio} />;
    
    switch (activeTab) {
      case AppTab.QURAN: return <QuranExplorer onAudioStateChange={setActiveAudio} activeAudio={activeAudio} />;
      case AppTab.HADITH: return <HadithVault onAudioStateChange={setActiveAudio} activeAudio={activeAudio} />;
      case AppTab.DEVELOPER: return <Developer />;
      case AppTab.ABOUT: return <About />;
      case AppTab.SYSTEMS_DEVELOPMENT: return <AIScholar />;
      case AppTab.LIBRARY: return <Library />;
      case AppTab.TOOLS: return <Tools />;
      case AppTab.ART_STUDIO: return <ArtStudio />;
      case AppTab.SADAQAH: return <Sadaqah />;
      default: return <QuranExplorer onAudioStateChange={setActiveAudio} activeAudio={activeAudio} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={handleTabChange} goHome={() => setShowDashboard(true)}>
      {renderContent()}
      
      {/* Global Bottom Player Bar */}
      {activeAudio && (
        <div className="fixed bottom-0 left-0 right-0 md:left-20 z-[60] p-4 md:p-6 animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-4xl mx-auto glass-ui bg-navy-950/90 dark:bg-navy-900/95 backdrop-blur-2xl rounded-[2rem] border border-gold/30 p-4 md:p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
             <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gold rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                   <div className="flex gap-1 h-6 items-end">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-1 bg-navy-950 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s`, height: `${40 + Math.random() * 60}%` }}></div>
                      ))}
                   </div>
                </div>
                <div className="min-w-0">
                   <span className="block text-[8px] md:text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-1">NOW RECITING</span>
                   <h4 className="text-sm md:text-lg font-black text-white truncate leading-tight uppercase tracking-tight">{activeAudio.title}</h4>
                   <p className="text-[10px] md:text-xs text-slate-400 truncate uppercase tracking-widest">{activeAudio.subtitle}</p>
                </div>
             </div>
             <button 
                onClick={stopAudioGlobal}
                className="px-6 md:px-10 py-3 md:py-4 bg-red-500 text-white font-black rounded-xl md:rounded-2xl hover:bg-red-600 transition-all shadow-lg text-[10px] md:text-xs uppercase tracking-widest"
             >
               STOP
             </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
