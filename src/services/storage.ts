import { HistoryItem, RiskCategory } from '../types';

const STORAGE_KEY = 'cybershield_analysis_history_v1';

// Mask likely OTPs (4-8 consecutive digits) and sensitive markers
function maskSensitiveText(input: string): string {
  return input
    .replace(/(password|pass|pin|mpin)\s*[:=]\s*(\S+)/gi, '$1: [REDACTED]')
    .replace(/\b\d{4,8}\b/g, '••••••')
    .slice(0, 160);
}

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse history from localStorage', err);
    return [];
  }
}

export function saveHistoryItem(item: {
  type: 'message' | 'url';
  input: string;
  riskCategory: RiskCategory;
  resultSummary: string;
}): HistoryItem {
  const current = getHistory();
  const newItem: HistoryItem = {
    id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: item.type,
    inputPreview: maskSensitiveText(item.input),
    riskCategory: item.riskCategory,
    timestamp: new Date().toISOString(),
    resultSummary: item.resultSummary.slice(0, 240),
  };

  // Keep latest 40 items
  const updated = [newItem, ...current.slice(0, 39)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save history item to localStorage', err);
  }

  return newItem;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear history from localStorage', err);
  }
}

export function exportHistoryAsJson(): void {
  const history = getHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cybershield-history-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
