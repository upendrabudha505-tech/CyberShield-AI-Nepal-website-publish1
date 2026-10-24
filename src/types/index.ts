export type Language = 'en' | 'np';

export type RiskCategory = 'Low' | 'Medium' | 'High' | 'Inconclusive';

export interface MessageAnalysisResult {
  riskCategory: RiskCategory;
  confidenceLevel: number;
  confidenceExplanation: string;
  suspiciousPhrases: string[];
  reasons: string[];
  safeActions: string[];
  explanation_en: string;
  explanation_np: string;
  nepalContextNotes: string;
  disclaimer: string;
  hadRedactions?: boolean;
  aiAssisted?: boolean;
  analyzedAt: string;
}

export interface UrlAnalysisResult {
  riskCategory: RiskCategory;
  confidenceScore: number;
  primaryConcerns: string[];
  recommendations: string[];
  explanation_en: string;
  explanation_np: string;
  impersonationRisk: string;
  disclaimer: string;
  reputationNotice: string;
  inspectionData: {
    protocol: string;
    hostname: string;
    port: string;
    isIpAddress: boolean;
    hasQueryParams: boolean;
    staticSignals: string[];
  };
  aiAssisted?: boolean;
  analyzedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isRefusal?: boolean;
}

export interface HistoryItem {
  id: string;
  type: 'message' | 'url';
  inputPreview: string;
  riskCategory: RiskCategory;
  timestamp: string;
  resultSummary: string;
}

export interface QuizQuestion {
  id: number;
  question_en: string;
  question_np: string;
  options_en: string[];
  options_np: string[];
  correctIndex: number;
  explanation_en: string;
  explanation_np: string;
}

export interface LearningLesson {
  id: string;
  title_en: string;
  title_np: string;
  category: string;
  readTime: string;
  summary_en: string;
  summary_np: string;
  content_en: string[];
  content_np: string[];
  nepalTip_en: string;
  nepalTip_np: string;
  keyTakeaways: string[];
}
