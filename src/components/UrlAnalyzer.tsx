import React, { useState } from 'react';
import {
  Link2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Server,
  Globe,
  Copy,
  Check,
  BookmarkPlus,
  RefreshCw,
  Sparkles,
  Info,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { Language, RiskCategory, UrlAnalysisResult } from '../types';
import { getTranslation } from '../data/translations';
import { sampleUrls } from '../data/sampleData';
import { analyzeUrl } from '../services/api';
import { saveHistoryItem } from '../services/storage';

interface UrlAnalyzerProps {
  language: Language;
}

export const UrlAnalyzer: React.FC<UrlAnalyzerProps> = ({ language }) => {
  const t = getTranslation(language);
  const isNepali = language === 'np';

  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UrlAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAnalyze = async () => {
    if (!inputUrl.trim()) {
      setError(isNepali ? 'कृपया कुनै वेबसाइटको ठेगाना राख्नुहोस्।' : 'Please enter a URL to inspect.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSavedSuccess(false);

    try {
      const data = await analyzeUrl(inputUrl.trim(), language);
      setResult(data);

      // Save to local privacy history
      saveHistoryItem({
        type: 'url',
        input: inputUrl.trim(),
        riskCategory: data.riskCategory,
        resultSummary: isNepali ? data.explanation_np : data.explanation_en,
      });
      setSavedSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'URL analysis failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setInputUrl(sampleUrl);
    setError(null);
    setResult(null);
    setSavedSuccess(false);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const summary = `CyberShield AI URL Safety Report
Target: ${result.inspectionData.hostname} (${result.inspectionData.protocol.toUpperCase()})
Risk Rating: ${result.riskCategory}
Confidence Score: ${result.confidenceScore}%
Summary (${isNepali ? 'नेपाली' : 'English'}): ${isNepali ? result.explanation_np : result.explanation_en}
Concerns:
${result.primaryConcerns.map((c) => '- ' + c).join('\n')}
Recommendations:
${result.recommendations.map((r) => '- ' + r).join('\n')}
Notice: ${result.reputationNotice}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskBadge = (category: RiskCategory) => {
    switch (category) {
      case 'High':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
          label: isNepali ? 'उच्च जोखिम (High Risk)' : 'High Risk Domain',
        };
      case 'Medium':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          label: isNepali ? 'मध्यम जोखिम (Medium Risk)' : 'Medium Risk Warning',
        };
      case 'Low':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          label: isNepali ? 'न्यून जोखिम (Low Risk)' : 'Low Risk Structure',
        };
      default:
        return {
          bg: 'bg-slate-700/30 border-slate-600 text-slate-300',
          icon: <HelpCircle className="w-5 h-5 text-slate-400" />,
          label: isNepali ? 'अनिर्णित (Inconclusive)' : 'Inconclusive Structure',
        };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
          <Link2 className="w-3.5 h-3.5" />
          <span>{isNepali ? 'सुरक्षित लिङ्क स्क्यान' : 'SSRF-Safe URL Inspector'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t.urlAnalyzer.title}
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          {t.urlAnalyzer.subtitle}
        </p>
      </div>

      {/* Input Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        {/* Presets */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {t.urlAnalyzer.presetsTitle}
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleUrls.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample.url)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                {isNepali ? sample.title_np : sample.title_en}
              </button>
            ))}
          </div>
        </div>

        {/* Input bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder={t.urlAnalyzer.placeholder}
              className="w-full bg-[#070D18] border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || !inputUrl.trim()}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer whitespace-nowrap shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t.urlAnalyzer.analyzing}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.urlAnalyzer.btnAnalyze}</span>
              </>
            )}
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center justify-between">
          <span>{isNepali ? 'वेबसाइट नखोलीकन सुरक्षित रूपमा विश्लेषण गरिन्छ (SSRF सुरक्षित)' : 'Analyzed statically without visiting to prevent SSRF and tracking'}</span>
          <span className="font-mono">Port & Protocol Check</span>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results View */}
      {result && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6 animate-fadeIn">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {getRiskBadge(result.riskCategory).icon}
              <div>
                <span className="text-xs text-slate-400 font-mono block">
                  {t.urlAnalyzer.riskCategory}
                </span>
                <span className="text-xl font-bold text-white">
                  {getRiskBadge(result.riskCategory).label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono block">
                  {isNepali ? 'सुरक्षा अंक' : 'Confidence Score'}
                </span>
                <span className="text-xl font-bold text-cyan-400 tabular-nums">
                  {result.confidenceScore}%
                </span>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                <button
                  onClick={handleCopyReport}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy URL Report"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                {savedSuccess && (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Technical Diagnostics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-mono block">
                {t.urlAnalyzer.protocol}
              </span>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                {result.inspectionData.protocol === 'https' ? (
                  <>
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 uppercase">HTTPS (Encrypted)</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-300 uppercase">HTTP (Unencrypted)</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-mono block">
                {t.urlAnalyzer.hostname}
              </span>
              <div className="text-sm font-mono text-slate-200 truncate" title={result.inspectionData.hostname}>
                {result.inspectionData.hostname}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-mono block">
                Host Classification
              </span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>{result.inspectionData.isIpAddress ? 'Direct IP Address' : 'Domain Name'}</span>
              </div>
            </div>
          </div>

          {/* Primary Assessment Summary */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {isNepali ? 'विश्लेषण निष्कर्ष (Summary)' : 'Structural Security Assessment'}
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {isNepali ? result.explanation_np : result.explanation_en}
            </p>
            {result.impersonationRisk && (
              <p className="text-xs text-amber-300 pt-1 border-t border-slate-800/60 font-mono">
                {String(result.impersonationRisk)}
              </p>
            )}
          </div>

          {/* Primary Concerns */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.urlAnalyzer.primaryConcerns}
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {result.primaryConcerns.map((concern, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">✕</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safe Recommendations */}
          <div className="space-y-2 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
            <h3 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.urlAnalyzer.recommendations}</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold shrink-0">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Preliminary Assessment Notice */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>{t.urlAnalyzer.reputationNotice}</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {result.reputationNotice || t.urlAnalyzer.reputationNoticeText}
            </p>
            <p className="text-slate-400 pt-1 text-[11px]">
              {result.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
