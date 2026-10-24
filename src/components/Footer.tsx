import React from 'react';
import { Shield, ExternalLink, AlertTriangle, Phone, Mail } from 'lucide-react';
import { Language } from '../types';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, language }) => {
  const isNepali = language === 'np';

  return (
    <footer className="mt-20 border-t border-slate-800 bg-[#070D18] text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>CyberShield AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isNepali
                ? 'नेपालमा हुने डिजिटल ठगी, फिसिङ र ओटिपी लुटबाट नागरिकहरूलाई सुरक्षित राख्ने उद्देश्यले निर्मित रक्षात्मक एआई प्रणाली।'
                : 'Empowering Nepali internet and digital payment users with real-time scam detection, URL threat scoring, and cybersecurity education.'}
            </p>
            <div className="text-xs text-slate-500 font-mono">
              Build: Hackathon 2026 Edition
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              {isNepali ? 'रक्षात्मक उपकरणहरू' : 'Security Tools'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('analyze-message')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isNepali ? 'शंकास्पद सन्देश विश्लेषक' : 'SMS & Phishing Analyzer'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('analyze-url')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isNepali ? 'सुरक्षित लिङ्क विश्लेषक' : 'Safe URL Inspector'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('chat')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isNepali ? 'एआई साइबर सहायक' : 'Cyber Assistant (AI)'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('learn')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {isNepali ? 'साइबर सुरक्षा सिकाइ केन्द्र' : 'Security Learning Center'}
                </button>
              </li>
            </ul>
          </div>

          {/* Nepal Emergency Hotlines */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              {isNepali ? 'नेपाल आपतकालीन सम्पर्क' : 'Nepal Cyber Response'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cyber Bureau Hotline: <strong className="text-white">1113</strong></span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Direct Bureau: +977-1-4412780</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>cyberbureau@nepalpolice.gov.np</span>
              </li>
              <li className="text-slate-400">
                Bhotahiti, Kathmandu, Nepal
              </li>
            </ul>
          </div>

          {/* Responsible Disclaimer */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{isNepali ? 'कानूनी दायित्व सीमा' : 'Operational Disclaimer'}</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isNepali
                ? 'CyberShield AI एक शैक्षिक तथा सहायक स्क्रिनिङ उपकरण हो। कुनै पनि स्क्यान १००% अचूक नहुन सक्छ। शंकास्पद आर्थिक कारोबारमा आफ्नो बैंक र प्रहरीसँग सिधै सम्पर्क गर्नुहोस्।'
                : 'CyberShield AI is an educational screening assistant and does not certify any communication as 100% safe. Always verify transactions directly with your bank.'}
            </p>
            <div className="mt-3">
              <button
                onClick={() => onSelectTab('privacy')}
                className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{isNepali ? 'गोपनीयता नीति र सीमाहरू' : 'Privacy & Limits'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} CyberShield AI · Built for Nepal Digital Safety
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onSelectTab('about')} className="hover:text-slate-300 cursor-pointer">
              {isNepali ? 'परियोजना परिचय' : 'About'}
            </button>
            <span>·</span>
            <button onClick={() => onSelectTab('privacy')} className="hover:text-slate-300 cursor-pointer">
              {isNepali ? 'गोपनीयता' : 'Privacy'}
            </button>
            <span>·</span>
            <button onClick={() => onSelectTab('history')} className="hover:text-slate-300 cursor-pointer">
              {isNepali ? 'इतिहास' : 'Local History'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
