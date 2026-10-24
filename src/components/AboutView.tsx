import React from 'react';
import {
  Shield,
  Layers,
  Users,
  AlertTriangle,
  Lightbulb,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Server,
  Cpu,
  Lock,
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';

interface AboutViewProps {
  language: Language;
}

export const AboutView: React.FC<AboutViewProps> = ({ language }) => {
  const t = getTranslation(language);
  const isNepali = language === 'np';

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <Shield className="w-3.5 h-3.5" />
          <span>{isNepali ? 'ह्याकाथन परियोजना प्रस्तुति' : 'Hackathon Project Overview'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t.about.title}
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          {t.about.subtitle}
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem */}
        <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">
            {t.about.problemTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.about.problemText}
          </p>
          <div className="pt-2 text-xs text-slate-400 space-y-1 border-t border-slate-800">
            <span className="font-semibold text-slate-300 block">{isNepali ? 'मुख्य जोखिम समूह:' : 'Vulnerable Demographic:'}</span>
            <p>{isNepali ? 'पहिलो पटक मोबाइल बैंकिङ प्रयोग गर्ने नागरिक, रेमिट्यान्स प्राप्तकर्ता परिवार र ज्येष्ठ नागरिकहरू।' : 'First-time digital payment users, remittance recipient families, and students seeking foreign education or work permits.'}</p>
          </div>
        </div>

        {/* Solution */}
        <div className="glass-panel p-6 sm:p-7 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">
            {t.about.solutionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.about.solutionText}
          </p>
          <div className="pt-2 text-xs text-slate-400 space-y-1 border-t border-slate-800">
            <span className="font-semibold text-emerald-400 block">{isNepali ? 'मुख्य विशेषता:' : 'Key Differentiation:'}</span>
            <p>{isNepali ? 'नेपालका स्थानीय बैंकिङ (eSewa, Khalti, ConnectIPS) का वास्तविक ठगीका ढाँचाहरूमा आधारित एआई विश्लेषण।' : 'Localized contextual analysis trained on actual Nepali social engineering techniques, available in both Nepali and English.'}</p>
          </div>
        </div>
      </div>

      {/* Target Users */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <span>{isNepali ? 'लक्षित प्रयोगकर्ताहरू (Target Users)' : 'Target User Personas'}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <h3 className="text-sm font-semibold text-white">
              {isNepali ? '१. सामान्य नागरिक तथा विद्यार्थी' : '1. Students & General Public'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isNepali
                ? 'नयाँ अफर, फ्रि रिचार्ज वा चिठ्ठाका सन्देशहरू प्राप्त हुँदा तत्काल शंकास्पद हो वा होइन जाँच्न।'
                : 'Instantly verifying suspicious offers, mobile recharge claims, and social media employment posts.'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <h3 className="text-sm font-semibold text-white">
              {isNepali ? '२. साना व्यापारी तथा पसलेहरू' : '2. Small Merchants & Retailers'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isNepali
                ? 'क्युआर कोड भुक्तानी र वालेट कारोबारमा नक्कली मेसेज वा गलत स्क्रिनसटबाट ठगिनबाट जोगिन।'
                : 'Guarding QR payment receipts against spoofed transaction SMS messages and fake payment screenshots.'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
            <h3 className="text-sm font-semibold text-white">
              {isNepali ? '३. परिवारका अग्रज सदस्यहरू' : '3. Elderly & Remittance Families'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isNepali
                ? 'अपरिचित नम्बरबाट आउने इमो वा ह्वाट्सएप कलमा पिन वा ओटिपी नदिन सचेत रहन।'
                : 'Protecting life savings against WhatsApp/Imo lottery callers demanding urgent authorization codes.'}
            </p>
          </div>
        </div>
      </div>

      {/* System Architecture */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>{t.about.architectureTitle}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {isNepali
              ? 'प्रणालीको प्राविधिक बनोट र सुरक्षा डिजाइन'
              : 'End-to-end technical implementation and privacy boundary'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <Cpu className="w-4 h-4" />
              <span>Frontend (Client)</span>
            </div>
            <h3 className="text-sm font-semibold text-white">React 19 & Tailwind CSS</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Responsive single-page application</li>
              <li>• Client-side credential pre-masking</li>
              <li>• Local privacy storage with JSON export</li>
              <li>• English / Nepali dynamic localization</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Server className="w-4 h-4" />
              <span>Backend (Server)</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Node.js & Express API</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• SSRF-Safe URL structural parser</li>
              <li>• In-memory sliding window rate limiter</li>
              <li>• Heuristic fallback security engine</li>
              <li>• Zero persistent logging of user texts</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
              <Lock className="w-4 h-4" />
              <span>Threat AI Engine</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Gemini 3.8 Flash SDK</h3>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• @google/genai server-side client</li>
              <li>• JSON schema enforcement</li>
              <li>• Defensive cybersecurity guardrails</li>
              <li>• Nepal scam ontology & bilingual reasoning</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Real Limitations & Future Improvements */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>{t.about.limitationsTitle}</span>
        </h2>
        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span><strong>{isNepali ? 'एआई को सीमा:' : 'Predictive Nature:'}</strong> {t.about.limitation1}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span><strong>{isNepali ? 'लिङ्क परीक्षण सीमा:' : 'No Remote Detonation:'}</strong> {t.about.limitation2}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong>{isNepali ? 'भावी विस्तार योजना:' : 'Future Roadmap:'}</strong> {t.about.limitation3}</span>
          </div>
        </div>
      </div>

      {/* Official Nepal Cyber Bureau & Incident Reporting Directory */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/30 space-y-4 bg-gradient-to-b from-slate-900 to-[#070D18]">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>{t.about.contactsTitle}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="text-sm font-semibold text-white">Nepal Police Cyber Bureau (नेपाल प्रहरी साइबर ब्युरो)</h3>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Toll-Free Hotline: <strong className="text-emerald-400 text-sm">1113</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Direct Line: +977-1-4412780 / 9851286770</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>cyberbureau@nepalpolice.gov.np</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Bhotahiti, Kathmandu, Nepal</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="text-sm font-semibold text-white">Digital Payment Helpdesks in Nepal</h3>
            <ul className="space-y-1 text-slate-300">
              <li>• <strong>eSewa Fraud Helpline:</strong> 1660-01-02121 / 01-5970020</li>
              <li>• <strong>Khalti Support:</strong> 1660-01-58888 / 01-5970017</li>
              <li>• <strong>ConnectIPS / NCHL:</strong> 01-4255306 / support@nchl.com.np</li>
              <li>• <strong>CERT-Nepal (NITC):</strong> cert@nitc.gov.np</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
