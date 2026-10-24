/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeDashboard } from './components/HomeDashboard';
import { MessageAnalyzer } from './components/MessageAnalyzer';
import { UrlAnalyzer } from './components/UrlAnalyzer';
import { ChatAssistant } from './components/ChatAssistant';
import { LearningCenter } from './components/LearningCenter';
import { HistoryView } from './components/HistoryView';
import { AboutView } from './components/AboutView';
import { PrivacyView } from './components/PrivacyView';
import { Language } from './types';
import { checkServerHealth } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('cybershield_lang');
    return saved === 'np' ? 'np' : 'en';
  });

  // Persist language selection
  const handleToggleLanguage = () => {
    setLanguage((prev) => {
      const next: Language = prev === 'en' ? 'np' : 'en';
      localStorage.setItem('cybershield_lang', next);
      return next;
    });
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    checkServerHealth().catch(() => {
      // Background check
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-slate-100 font-sans selection:bg-emerald-500/25 selection:text-emerald-300">
      {/* Background radial gradient glow for subtle cyber atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[140px]" />
      </div>

      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 z-10 relative">
        {currentTab === 'home' && (
          <HomeDashboard onSelectTab={handleSelectTab} language={language} />
        )}
        {currentTab === 'analyze-message' && (
          <MessageAnalyzer language={language} />
        )}
        {currentTab === 'analyze-url' && (
          <UrlAnalyzer language={language} />
        )}
        {currentTab === 'chat' && (
          <ChatAssistant language={language} />
        )}
        {currentTab === 'learn' && (
          <LearningCenter language={language} />
        )}
        {currentTab === 'history' && (
          <HistoryView language={language} />
        )}
        {currentTab === 'about' && (
          <AboutView language={language} />
        )}
        {currentTab === 'privacy' && (
          <PrivacyView language={language} />
        )}
      </main>

      {/* Footer */}
      <Footer onSelectTab={handleSelectTab} language={language} />
    </div>
  );
}
