
import React, { useState } from 'react';
import Layout from './components/Layout';
import QuranExplorer from './components/QuranExplorer';
import HadithVault from './components/HadithVault';
import Developer from './components/Developer';
import About from './components/About';
import AIScholar from './components/AIScholar';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.QURAN);

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.QURAN:
        return <QuranExplorer />;
      case AppTab.HADITH:
        return <HadithVault />;
      case AppTab.DEVELOPER:
        return <Developer />;
      case AppTab.ABOUT:
        return <About />;
      case AppTab.QURAN_AI:
        return <AIScholar />;
      default:
        return <QuranExplorer />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
