import React, { useState } from 'react';
import { Shield, PhoneCall, Menu, X, Globe } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = getTranslation(language);

  const navLinks = [
    { id: 'home', label: t.nav.home },
    { id: 'analyze-message', label: t.nav.analyzeMessage },
    { id: 'analyze-url', label: t.nav.analyzeUrl },
    { id: 'chat', label: t.nav.chat },
    { id: 'learn', label: t.nav.learn },
    { id: 'history', label: t.nav.history },
    { id: 'about', label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group whitespace-nowrap shrink-0 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 group-hover:scale-105 transition-all">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-sans">
              CyberShield <span className="text-emerald-400">AI</span>
            </span>
          </button>

          {/* Zone 2: Concise Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive ? 'text-emerald-400 font-semibold' : 'hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (Language Toggle + Cyber Bureau Helpline) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleLanguage}
              aria-label="Switch Language"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800/80 border border-slate-700 text-slate-200 hover:text-emerald-300 hover:border-slate-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
            </button>

            <a
              href="tel:1113"
              title="Nepal Police Cyber Bureau Hotline (1113)"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 transition-colors whitespace-nowrap shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Cyber Bureau 1113</span>
            </a>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F172A] border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onSelectTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-3">
            <span>Cyber Bureau Nepal Hotline:</span>
            <a href="tel:1113" className="font-bold text-emerald-400">
              1113 / +977-1-4412780
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
