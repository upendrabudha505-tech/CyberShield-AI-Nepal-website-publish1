import React from 'react';
import {
  ShieldAlert,
  MessageSquareWarning,
  Link2,
  Bot,
  GraduationCap,
  History,
  PhoneCall,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';

interface HomeDashboardProps {
  onSelectTab: (tab: string) => void;
  language: Language;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onSelectTab, language }) => {
  const t = getTranslation(language);
  const isNepali = language === 'np';

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-10 lg:p-12 border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.hero.kicker}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance">
              {t.hero.title}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelectTab('analyze-message')}
                className="px-5 py-3 text-sm font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <MessageSquareWarning className="w-4 h-4" />
                <span>{t.hero.ctaAnalyzeMessage}</span>
              </button>

              <button
                onClick={() => onSelectTab('analyze-url')}
                className="px-5 py-3 text-sm font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Link2 className="w-4 h-4 text-emerald-400" />
                <span>{t.hero.ctaAnalyzeUrl}</span>
              </button>

              <button
                onClick={() => onSelectTab('chat')}
                className="px-5 py-3 text-sm font-semibold rounded-lg bg-slate-900/80 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>{t.hero.ctaChat}</span>
              </button>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                {isNepali ? 'गोपनीयता केन्द्रित (कुनै पासवर्ड संकलन छैन)' : 'Zero Credential Logging'}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isNepali ? 'नेपाली तथा अंग्रेजी भाषा समर्थन' : 'Bilingual EN / नेपाली'}
              </span>
            </div>
          </div>

          {/* Hero Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950/80 aspect-[16/10] group">
              <img
                src="/src/assets/images/cyber_shield_hero_1792825584958.jpg"
                alt="CyberShield AI Digital Defense Holographic Shield"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback if image path has issue
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Subtle glass overlay text badge */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-emerald-400 font-semibold">NEPAL CYBER DEFENSE</span>
                <span className="text-slate-400">Gemini 3.8 Flash Powered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-Risk Scam Vectors in Nepal Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <span>{t.quickStats.threatTitle}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {isNepali
                ? 'नेपाली प्रयोगकर्ताहरूलाई लक्षित गरी सामाजिक सञ्जाल र एसएमएसमा भइरहेका मुख्य ठगीहरू'
                : 'Active fraud trends targeting digital wallets and mobile banking users in Nepal'}
            </p>
          </div>
          <button
            onClick={() => onSelectTab('learn')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>{isNepali ? 'सबै पाठहरू हेर्नुहोस्' : 'Explore Learning Modules'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                CRITICAL THREAT
              </span>
              <span className="text-xs text-slate-500 font-mono">eSewa / Khalti</span>
            </div>
            <h3 className="text-base font-semibold text-white">
              {t.quickStats.walletFraud}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.quickStats.walletFraudDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={() => onSelectTab('analyze-message')}
                className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isNepali ? 'यस्ता सन्देश जाँच्नुहोस्' : 'Test Sample Lottery SMS'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                CREDENTIAL HARVEST
              </span>
              <span className="text-xs text-slate-500 font-mono">Commercial Banks</span>
            </div>
            <h3 className="text-base font-semibold text-white">
              {t.quickStats.smsPhishing}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.quickStats.smsPhishingDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={() => onSelectTab('analyze-message')}
                className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isNepali ? 'केवाइसी सन्देश जाँच्नुहोस्' : 'Test KYC Smishing SMS'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                ADVANCE FEE FRAUD
              </span>
              <span className="text-xs text-slate-500 font-mono">Viber / Social Media</span>
            </div>
            <h3 className="text-base font-semibold text-white">
              {t.quickStats.visaFraud}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.quickStats.visaFraudDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={() => onSelectTab('chat')}
                className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isNepali ? 'एआईसँग सुरक्षा सल्लाह लिनुहोस्' : 'Ask AI How to Verify Jobs'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">
          {isNepali ? 'मुख्य सुरक्षा उपकरणहरू' : 'Core Cyber Defense Modules'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1 */}
          <div
            onClick={() => onSelectTab('analyze-message')}
            className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <MessageSquareWarning className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                {isNepali ? 'शंकास्पद सन्देश विश्लेषक' : 'SMS & Message Analyzer'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isNepali
                  ? 'कुनै पनि एसएमएस वा इमेल पेस्ट गरी सामाजिक इन्जिनियरिङ, डर र दबाबका संकेतहरू तत्काल पहिचान गर्नुहोस्।'
                  : 'Screen suspicious texts for urgency traps, OTP harvesting, and fake prize patterns.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-emerald-400 flex items-center justify-between">
              <span>{isNepali ? 'सन्देश स्क्यान गर्नुहोस्' : 'Scan Message'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Module 2 */}
          <div
            onClick={() => onSelectTab('analyze-url')}
            className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Link2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {isNepali ? 'सुरक्षित लिङ्क विश्लेषक' : 'Safe URL Inspector'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isNepali
                  ? 'वेबसाइट नखोलीकन त्यसको डोमेन, एसएसएल सुरक्षा र नक्कली ब्रान्डको नक्कल सुरक्षित रूपमा परीक्षण गर्नुहोस्।'
                  : 'Inspect web links safely without visiting. Checks syntax, brand typosquatting, and SSL protocol.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-cyan-400 flex items-center justify-between">
              <span>{isNepali ? 'लिङ्क परीक्षण गर्नुहोस्' : 'Inspect Link'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Module 3 */}
          <div
            onClick={() => onSelectTab('chat')}
            className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-purple-400 transition-colors">
                {isNepali ? 'एआई साइबर सहायक' : 'Cyber Defense Assistant'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isNepali
                  ? 'खाता ह्याक भएमा तुरुन्त चाल्नुपर्ने कदमहरू र अनलाइन सुरक्षा सम्बन्धी कुनै पनि जिज्ञासा सोध्नुहोस्।'
                  : 'Ask practical defensive cybersecurity questions, incident response guidelines, and safe 2FA setup.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-purple-400 flex items-center justify-between">
              <span>{isNepali ? 'कुराकानी सुरु गर्नुहोस्' : 'Open Assistant'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Module 4 */}
          <div
            onClick={() => onSelectTab('learn')}
            className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors">
                {isNepali ? 'साइबर सुरक्षा सिकाइ' : 'Interactive Learning'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isNepali
                  ? '८ वटा व्यवहारिक पाठहरू र अन्तरक्रियात्मक प्रश्नोत्तरी मार्फत आफ्नो डिजिटल सुरक्षा ज्ञान बढाउनुहोस्।'
                  : '8 beginner-friendly modules on OTP safety, 2FA, password strength, and an interactive quiz.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-semibold text-amber-400 flex items-center justify-between">
              <span>{isNepali ? 'सिकाइ सुरु गर्नुहोस्' : 'Take Lesson & Quiz'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Nepal Cyber Bureau Callout Banner */}
      <section className="rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <PhoneCall className="w-4 h-4" />
            <span>{isNepali ? 'नेपाल आपतकालीन साइबर सहायता' : 'Nepal Cyber Bureau Emergency Hotline'}</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            {isNepali ? 'के तपाईंको पैसा ठगीमा पर्यो वा खाता ह्याक भयो?' : 'Victim of a cyber crime or unauthorized transaction?'}
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            {isNepali
              ? 'तुरुन्त आफ्नो बैंक खाता रोक्का गर्नुहोस् र नेपाल प्रहरी साइबर ब्युरोको निःशुल्क हटलाइन १११३ वा फोन ०१-४४१२७८० मा सम्पर्क गर्नुहोस्।'
              : 'Immediately freeze your bank/wallet account and contact the Nepal Police Cyber Bureau via toll-free hotline 1113 or +977-1-4412780.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:1113"
            className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors whitespace-nowrap"
          >
            {isNepali ? 'हटलाइन १११३ मा कल गर्नुहोस्' : 'Call Hotline 1113'}
          </a>
          <button
            onClick={() => onSelectTab('about')}
            className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            {isNepali ? 'सम्पर्क विवरण' : 'View Full Details'}
          </button>
        </div>
      </section>
    </div>
  );
};
