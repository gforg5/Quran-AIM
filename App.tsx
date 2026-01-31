
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
    </Layout>
  );
};

export default App;
