import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  AlertTriangle,
  Server,
  Trash2,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { clearHistory } from '../services/storage';

interface PrivacyViewProps {
  language: Language;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ language }) => {
  const t = getTranslation(language);
  const isNepali = language === 'np';
  const [clearedNotice, setClearedNotice] = useState(false);

  const handlePurgeAll = () => {
    clearHistory();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <Lock className="w-3.5 h-3.5" />
          <span>{isNepali ? 'गोपनीयता तथा कानूनी नीति' : 'Zero-Logging Privacy Architecture'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t.privacy.title}
        </h1>
        <p className="text-sm text-slate-300">
          {t.privacy.subtitle}
        </p>
      </div>

      {/* Core Privacy Guarantees */}
      <div className="space-y-4">
        {/* Policy 1 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>{t.privacy.dataStorageTitle}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.privacy.dataStorageText}
          </p>
          <div className="p-3 bg-slate-950/70 rounded-xl text-xs font-mono text-slate-400 border border-slate-800/80">
            Regex Pattern: <code className="text-emerald-400">\b\d{'{4,8}'}\b</code> & <code className="text-emerald-400">(pin|password|otp)</code> masked to [PROTECTED]
          </div>
        </div>

        {/* Policy 2 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{t.privacy.aiLimitationsTitle}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.privacy.aiLimitationsText}
          </p>
          <div className="text-xs text-slate-400 bg-amber-950/20 p-3 rounded-xl border border-amber-500/20">
            {isNepali
              ? 'कुनै पनि सुरक्षा स्क्यान १००% अचूक हुँदैन। यो प्रणाली केवल सहयोगी सल्लाहकार हो। यदि तपाईंलाई शंका छ भने आधिकारिक नम्बरमा फोन गरी पुष्टि गर्नुहोस्।'
              : 'Defensive scanning is heuristic and predictive. CyberShield AI does not issue certified security guarantees. Never disclose credentials under any circumstances.'}
          </div>
        </div>

        {/* Policy 3 */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Server className="w-4 h-4" />
            <span>{t.privacy.ssrfSafetyTitle}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.privacy.ssrfSafetyText}
          </p>
        </div>
      </div>

      {/* Local Storage Control */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>{isNepali ? 'स्थानीय डाटा पूर्ण निष्कासन (Data Purge)' : 'Client-Side Data Retention Control'}</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          {isNepali
            ? 'तपाईंले परीक्षण गर्नुभएका सबै रेकर्डहरू केवल तपाईंको यही ब्राउजरको लोकल स्टोरेजमा मात्र राखिएका हुन्छन्। जुनसुकै बेला एक क्लिकमा सबै रेकर्ड मेटाउन सक्नुहुन्छ।'
            : 'All scan previews and analysis results reside solely in your browser localStorage. You can permanently erase all locally stored data at any time.'}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handlePurgeAll}
            className="px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/40 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isNepali ? 'सबै स्थानीय डाटा मेटाउनुहोस्' : 'Permanently Clear All Local History'}</span>
          </button>
          {clearedNotice && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isNepali ? 'स्थानीय डाटा मेटाइयो।' : 'All local history deleted successfully.'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Emergency Guidance */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
        <span className="font-bold text-white block">
          {isNepali ? 'नेपाल प्रहरी साइबर ब्युरो सम्पर्क' : 'Active Threat Reporting (Nepal)'}
        </span>
        <p>{t.privacy.nepalBureauNotice}</p>
      </div>
    </div>
  );
};
