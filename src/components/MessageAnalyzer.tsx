import React, { useState } from 'react';
import {
  MessageSquareWarning,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  BookmarkPlus,
  RefreshCw,
  Sparkles,
  Info,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { Language, MessageAnalysisResult, RiskCategory } from '../types';
import { getTranslation } from '../data/translations';
import { sampleMessages } from '../data/sampleData';
import { analyzeMessage } from '../services/api';
import { saveHistoryItem } from '../services/storage';

interface MessageAnalyzerProps {
  language: Language;
}

export const MessageAnalyzer: React.FC<MessageAnalyzerProps> = ({ language }) => {
  const t = getTranslation(language);
  const isNepali = language === 'np';

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MessageAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError(isNepali ? 'कृपया विश्लेषणका लागि कुनै सन्देश राख्नुहोस्।' : 'Please enter or paste a message to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSavedSuccess(false);

    try {
      const data = await analyzeMessage(inputText.trim(), language);
      setResult(data);

      // Auto-save to privacy history
      saveHistoryItem({
        type: 'message',
        input: inputText.trim(),
        riskCategory: data.riskCategory,
        resultSummary: isNepali ? data.explanation_np : data.explanation_en,
      });
      setSavedSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (text: string) => {
    setInputText(text);
    setError(null);
    setResult(null);
    setSavedSuccess(false);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const summary = `CyberShield AI Analysis Report
Threat Level: ${result.riskCategory}
Confidence: ${result.confidenceLevel}% (${result.confidenceExplanation})
Summary (${isNepali ? 'नेपाली' : 'English'}): ${isNepali ? result.explanation_np : result.explanation_en}
Suspicious Phrases: ${result.suspiciousPhrases.join(', ')}
Key Recommendations:
${result.safeActions.map((a) => '- ' + a).join('\n')}
Disclaimer: ${result.disclaimer}`;

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
          label: isNepali ? 'उच्च जोखिम (High Risk)' : 'High Risk Threat',
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
          label: isNepali ? 'न्यून जोखिम (Low Risk)' : 'Low Risk Indication',
        };
      default:
        return {
          bg: 'bg-slate-700/30 border-slate-600 text-slate-300',
          icon: <HelpCircle className="w-5 h-5 text-slate-400" />,
          label: isNepali ? 'अनिर्णित (Inconclusive)' : 'Inconclusive Pattern',
        };
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <MessageSquareWarning className="w-3.5 h-3.5" />
          <span>{isNepali ? 'एआई सन्देश जाँच' : 'AI Smishing & Phishing Shield'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t.messageAnalyzer.title}
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          {t.messageAnalyzer.subtitle}
        </p>
      </div>

      {/* Input Panel */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        {/* Presets */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            {t.messageAnalyzer.presetsTitle}
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleMessages.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample.text)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                {isNepali ? sample.title_np : sample.title_en}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            maxLength={6000}
            placeholder={t.messageAnalyzer.placeholder}
            className="w-full bg-[#070D18] border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-y font-sans leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1 px-1">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              {isNepali ? 'ओटिपी वा पिन स्वतः गोप्य राखिन्छ' : 'Confidential numbers/OTPs are masked automatically'}
            </span>
            <span className="tabular-nums font-mono">
              {inputText.length} / 6000 {t.messageAnalyzer.characterCount}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !inputText.trim()}
              className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.messageAnalyzer.analyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.messageAnalyzer.btnAnalyze}</span>
                </>
              )}
            </button>

            {inputText && (
              <button
                onClick={() => {
                  setInputText('');
                  setResult(null);
                  setError(null);
                }}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {isNepali ? 'खाली गर्नुहोस्' : 'Clear'}
              </button>
            )}
          </div>

          <span className="text-xs text-slate-500 font-mono">
            Model: Gemini 3.8 Flash
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Result Box */}
      {result && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6 animate-fadeIn">
          {/* Top Banner with Risk Category */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              {getRiskBadge(result.riskCategory).icon}
              <div>
                <span className="text-xs text-slate-400 font-mono block">
                  {t.messageAnalyzer.riskCategory}
                </span>
                <span className="text-xl font-bold text-white">
                  {getRiskBadge(result.riskCategory).label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono block">
                  {t.messageAnalyzer.confidence}
                </span>
                <span className="text-xl font-bold text-emerald-400 tabular-nums">
                  {result.confidenceLevel}%
                </span>
              </div>

              <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                <button
                  onClick={handleCopyReport}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy Analysis Report"
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

          {/* Primary Summary Explanation */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {isNepali ? 'सारांश विश्लेषण (Summary)' : 'Core Assessment Summary'}
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {isNepali ? result.explanation_np : result.explanation_en}
            </p>
            {result.confidenceExplanation && (
              <p className="text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                <strong>{isNepali ? 'विश्वसनीयता विश्लेषण:' : 'Confidence basis:'}</strong>{' '}
                {result.confidenceExplanation}
              </p>
            )}
          </div>

          {/* Suspicious Phrases Extracted */}
          {result.suspiciousPhrases && result.suspiciousPhrases.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t.messageAnalyzer.suspiciousPhrases}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.suspiciousPhrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-md text-xs font-mono bg-rose-500/10 border border-rose-500/30 text-rose-300"
                  >
                    "{phrase}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reasons & Signals */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.messageAnalyzer.reasons}
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {result.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 shrink-0 font-bold">✕</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Safe Recommended Next Steps */}
          <div className="space-y-2 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <h3 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.messageAnalyzer.safeActions}</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {result.safeActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Nepal Context Notes */}
          {result.nepalContextNotes && (
            <div className="space-y-1 text-xs text-slate-300 border-l-2 border-emerald-500 pl-3 py-1">
              <span className="font-semibold text-emerald-400 block">
                {t.messageAnalyzer.nepalContext}:
              </span>
              <p className="text-slate-300">{result.nepalContextNotes}</p>
            </div>
          )}

          {/* Honest Disclaimer */}
          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
            <p>
              <strong>{isNepali ? 'सुरक्षा सूचना:' : 'Operational Disclaimer:'}</strong>{' '}
              {result.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
