import { Language, MessageAnalysisResult, UrlAnalysisResult } from '../types';

export async function analyzeMessage(message: string, language: Language): Promise<MessageAnalysisResult> {
  const response = await fetch('/api/analyze-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}: Failed to analyze message`);
  }

  const data = await response.json();
  return {
    ...data,
    analyzedAt: new Date().toISOString(),
  };
}

export async function analyzeUrl(url: string, language: Language): Promise<UrlAnalysisResult> {
  const response = await fetch('/api/analyze-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, language }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}: Failed to analyze URL`);
  }

  const data = await response.json();
  return {
    ...data,
    analyzedAt: new Date().toISOString(),
  };
}

export async function sendChatMessage(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  language: Language
): Promise<{ reply: string; isRefusal?: boolean }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, language }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned ${response.status}: Chat failed`);
  }

  return response.json();
}

export async function checkServerHealth(): Promise<{ status: string; aiEnabled: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return res.json();
    }
    return { status: 'degraded', aiEnabled: false };
  } catch {
    return { status: 'offline', aiEnabled: false };
  }
}
