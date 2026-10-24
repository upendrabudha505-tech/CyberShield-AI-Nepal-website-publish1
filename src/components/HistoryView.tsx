import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  Download,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Link as LinkIcon,
  Lock,
} from 'lucide-react';
import { HistoryItem, Language, RiskCategory } from '../types';
import { getTranslation } from '../data/translations';
import { getHistory, clearHistory, exportHistoryAsJson } from '../services/storage';

interface HistoryViewProps {
  language: Language;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ language }) => {
  const t = getTranslation(language);
  const isNepali = language === 'np';

  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'message' | 'url'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setHistoryItems([]);
    setShowClearConfirm(false);
  };

  const filteredItems = historyItems.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const getRiskIcon = (risk: RiskCategory) => {
    switch (risk) {
      case 'High':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'Medium':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'Low':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>{t.history.maskedBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.history.title}
          </h1>
          <p className="text-sm text-slate-300">
            {t.history.subtitle}
          </p>
        </div>

        {historyItems.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={exportHistoryAsJson}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.history.exportBtn}</span>
            </button>

            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.history.btnClearAll}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-950/60 p-1.5 rounded-lg border border-rose-500/40">
                <button
                  onClick={handleClear}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            filterType === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.history.filterAll} ({historyItems.length})
        </button>
        <button
          onClick={() => setFilterType('message')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            filterType === 'message' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.history.filterMessage}
        </button>
        <button
          onClick={() => setFilterType('url')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            filterType === 'url' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.history.filterUrl}
        </button>
      </div>

      {/* History Items List */}
      {filteredItems.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <History className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">
            {t.history.emptyState}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isNepali
              ? 'तपाईंले परीक्षण गरेका सन्देश र लिङ्कहरू यहाँ सुरक्षित हुनेछन्। सबै ओटिपी विवरणहरू स्वतः हटाइन्छ।'
              : 'Analyses conducted on this device will be organized here. All confidential authentication codes are protected.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-4 sm:p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-slate-800 text-slate-300">
                    {item.type === 'message' ? (
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-white capitalize">
                    {item.type === 'message' ? (isNepali ? 'सन्देश स्क्यान' : 'SMS Analysis') : (isNepali ? 'लिङ्क परीक्षण' : 'URL Inspection')}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold font-mono">
                  {getRiskIcon(item.riskCategory)}
                  <span
                    className={
                      item.riskCategory === 'High'
                        ? 'text-rose-400'
                        : item.riskCategory === 'Medium'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }
                  >
                    {item.riskCategory} Risk
                  </span>
                </div>
              </div>

              {/* Redacted Input Preview */}
              <div className="text-xs font-mono text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 truncate">
                {item.inputPreview}
              </div>

              {/* Assessment Summary */}
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {item.resultSummary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
