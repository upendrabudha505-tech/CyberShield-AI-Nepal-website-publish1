import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  AlertOctagon,
  Copy,
  Check,
  PhoneCall,
  Lock,
} from 'lucide-react';
import { ChatMessage, Language } from '../types';
import { getTranslation } from '../data/translations';
import { sendChatMessage } from '../services/api';

interface ChatAssistantProps {
  language: Language;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ language }) => {
  const t = getTranslation(language);
  const isNepali = language === 'np';

  const defaultWelcomeMessage: ChatMessage = {
    id: 'welcome-msg',
    role: 'assistant',
    content: isNepali
      ? 'नमस्कार! म साइबर शिल्ड एआई (CyberShield AI) सहायक हुँ। तपाईंलाई अनलाइन ठगी, शंकास्पद सन्देश, ओटिपी सुरक्षा वा खाता ह्याक भएको खण्डमा तुरुन्त चाल्नुपर्ने कदमबारे सहयोग गर्न म तयार छु। तपाईं मलाई नेपाली वा अंग्रेजीमा सोध्न सक्नुहुन्छ।'
      : 'Hello! I am the CyberShield AI Cybersecurity Assistant. I provide defensive cybersecurity advice, help you evaluate suspicious scams, guide incident recovery, and explain digital safety for Nepal. How can I assist your defense today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([defaultWelcomeMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        newHistory.map((m) => ({ role: m.role, content: m.content })),
        language
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRefusal: response.isRefusal,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const fallbackReply = isNepali
        ? 'माफ गर्नुहोस्, सन्देश पठाउन समस्या भयो। कृपया आफ्नो इन्टरनेट जाँचेर फेरि प्रयास गर्नुहोस्।'
        : 'Sorry, I encountered an issue processing your query. Please check your connection and try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([defaultWelcomeMessage]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptStarters = [
    t.chat.starter1,
    t.chat.starter2,
    t.chat.starter3,
    t.chat.starter4,
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>{isNepali ? 'रक्षात्मक एआई सहायक' : 'Defensive AI Guardian'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {t.chat.title}
          </h1>
          <p className="text-sm text-slate-300">
            {t.chat.subtitle}
          </p>
        </div>

        <button
          onClick={handleClear}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.chat.btnClear}</span>
        </button>
      </div>

      {/* Defensive policy notice */}
      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
        <Lock className="w-4 h-4 text-purple-400 shrink-0" />
        <span>{t.chat.refusalNotice}</span>
      </div>

      {/* Prompt Starters */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          {t.chat.startersTitle}
        </span>
        <div className="flex flex-wrap gap-2">
          {promptStarters.map((starter, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(starter)}
              disabled={isLoading}
              className="text-left px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
            >
              {starter}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-[520px] overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed space-y-2 relative group ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : msg.isRefusal
                      ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-bl-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.isRefusal && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>{isNepali ? 'रक्षात्मक प्रतिबन्ध' : 'Defensive Policy Boundary'}</span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                    {msg.content}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-slate-400">
                    <span className="font-mono">{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white p-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none p-4 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>{isNepali ? 'एआई सहायकले विश्लेषण गर्दैछ...' : 'CyberShield Assistant is typing defensive advice...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.chat.placeholder}
              maxLength={2000}
              disabled={isLoading}
              className="flex-1 bg-[#070D18] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />

            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">{t.chat.btnSend}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Emergency Help Badge */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-300">
          <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isNepali
              ? 'आकस्मिक ठगीमा सिधै नेपाल प्रहरी साइबर ब्युरोमा सम्पर्क गर्नुहोस्:'
              : 'For emergency assistance in Nepal, reach the Police Cyber Bureau directly:'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="tel:1113" className="font-bold text-emerald-400 hover:underline">
            Hotline: 1113
          </a>
          <span>·</span>
          <a href="tel:+97714412780" className="font-mono text-slate-300 hover:underline">
            +977-1-4412780
          </a>
        </div>
      </div>
    </div>
  );
};
