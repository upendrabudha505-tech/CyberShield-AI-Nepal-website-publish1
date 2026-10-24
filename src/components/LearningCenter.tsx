import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Language, LearningLesson, QuizQuestion } from '../types';
import { learningLessons, quizQuestions } from '../data/learningContent';

interface LearningCenterProps {
  language: Language;
}

export const LearningCenter: React.FC<LearningCenterProps> = ({ language }) => {
  const isNepali = language === 'np';

  const [activeTab, setActiveTab] = useState<'lessons' | 'quiz'>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<LearningLesson>(learningLessons[0]);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion: QuizQuestion = quizQuestions[currentQuestionIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentQuestion.id] !== undefined) return; // already answered
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizCompleted(false);
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{isNepali ? 'साइबर साक्षरता सिकाइ केन्द्र' : 'Interactive Cybersecurity Academy'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {isNepali ? 'डिजिटल सुरक्षा ज्ञान तथा प्रश्नोत्तरी' : 'Cybersecurity Learning & Certification Quiz'}
        </h1>
        <p className="text-sm text-slate-300 max-w-3xl">
          {isNepali
            ? 'नेपालको डिजिटल परिवेशमा सुरक्षित रहन ८ वटा व्यावहारिक पाठहरू अध्ययन गर्नुहोस् र प्रश्नोत्तरीमार्फत आफ्नो सुरक्षा तयारी जाँच्नुहोस्।'
            : 'Master 8 practical defense lessons tailored for digital citizens in Nepal and validate your awareness with our interactive quiz.'}
        </p>
      </div>

      {/* Segmented Control (Lessons vs Quiz) */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'lessons'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{isNepali ? '८ वटा सुरक्षा पाठहरू' : '8 Core Lessons'}</span>
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'quiz'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{isNepali ? 'सुरक्षा प्रश्नोत्तरी (Quiz)' : 'Knowledge Quiz'}</span>
        </button>
      </div>

      {/* LESSONS VIEW */}
      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Lessons Sidebar List */}
          <div className="lg:col-span-5 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-1">
              {isNepali ? 'पाठ छान्नुहोस्:' : 'Select Lesson Topic:'}
            </span>
            <div className="space-y-1.5">
              {learningLessons.map((lesson, index) => {
                const isSelected = selectedLesson.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span className="text-emerald-400 font-bold">0{index + 1}.</span>
                        <span>{lesson.category}</span>
                        <span>·</span>
                        <span>{lesson.readTime}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {isNepali ? lesson.title_np : lesson.title_en}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-emerald-400 translate-x-1' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Lesson Reading Area */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <span>{selectedLesson.category}</span>
                <span>·</span>
                <span>{selectedLesson.readTime}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {isNepali ? selectedLesson.title_np : selectedLesson.title_en}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {isNepali ? selectedLesson.summary_np : selectedLesson.summary_en}
              </p>
            </div>

            {/* Core Paragraphs */}
            <div className="space-y-3 text-sm text-slate-200 leading-relaxed font-sans">
              {(isNepali ? selectedLesson.content_np : selectedLesson.content_en).map((paragraph, i) => (
                <p key={i} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Nepal Specific Security Insight */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                {isNepali ? 'नेपाल विशेष सुरक्षा सल्लाह (Nepal Context)' : 'Nepal-Specific Defense Advisory'}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {isNepali ? selectedLesson.nepalTip_np : selectedLesson.nepalTip_en}
              </p>
            </div>

            {/* Key Takeaways */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isNepali ? 'मुख्य बुँदाहरू (Key Takeaways)' : 'Key Takeaways'}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedLesson.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                CyberShield Education Framework
              </span>
              <button
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                {isNepali ? 'ज्ञान परीक्षण गर्नुहोस्' : 'Test With Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ VIEW */}
      {activeTab === 'quiz' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6 max-w-3xl mx-auto">
          {!quizCompleted ? (
            <>
              {/* Quiz progress header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold block">
                    {isNepali ? 'प्रश्न' : 'Question'} {currentQuestionIndex + 1} / {quizQuestions.length}
                  </span>
                  <h3 className="text-lg font-bold text-white pt-1">
                    {isNepali ? currentQuestion.question_np : currentQuestion.question_en}
                  </h3>
                </div>
                <button
                  onClick={handleResetQuiz}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Reset Quiz"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {(isNepali ? currentQuestion.options_np : currentQuestion.options_en).map((opt, idx) => {
                  const hasAnswered = selectedAnswers[currentQuestion.id] !== undefined;
                  const isUserSelection = selectedAnswers[currentQuestion.id] === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let optionStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200';
                  if (hasAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                    } else if (isUserSelection) {
                      optionStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                    } else {
                      optionStyle = 'bg-slate-900/50 border-slate-800/50 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={hasAnswered}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {hasAnswered && isUserSelection && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after answer */}
              {selectedAnswers[currentQuestion.id] !== undefined && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 animate-fadeIn">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isNepali ? 'कारण र व्याख्या' : 'Explanation & Rationale'}</span>
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {isNepali ? currentQuestion.explanation_np : currentQuestion.explanation_en}
                  </p>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      {currentQuestionIndex < quizQuestions.length - 1
                        ? isNepali ? 'अर्को प्रश्न' : 'Next Question'
                        : isNepali ? 'नतिजा हेर्नुहोस्' : 'Finish & View Results'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Quiz Score Finished Screen */
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  {isNepali ? 'प्रश्नोत्तरी सम्पन्न भयो!' : 'Quiz Complete!'}
                </h3>
                <p className="text-sm text-slate-300">
                  {isNepali ? 'तपाईंको अन्तिम नतिजा:' : 'Your final defensive score:'}
                </p>
                <div className="text-4xl font-extrabold text-emerald-400 font-mono">
                  {calculateScore()} / {quizQuestions.length}
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {calculateScore() === quizQuestions.length
                  ? isNepali
                    ? 'उत्कृष्ट! तपाईंले नेपालमा हुने डिजिटल ठगी र सुरक्षा नियमहरू राम्रोसँग बुझ्नुभएको छ।'
                    : 'Outstanding! You demonstrate exceptional awareness of phishing, OTP safety, and Nepal scam vectors.'
                  : isNepali
                  ? 'राम्रो प्रयास! पाठहरू फेरि पढेर आफ्नो सुरक्षा तयारी थप बलियो बनाउन सक्नुहुन्छ।'
                  : 'Good effort! Review the core lessons to reinforce your defense against social engineering.'}
              </p>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleResetQuiz}
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  {isNepali ? 'फेरि परीक्षा दिनुहोस्' : 'Retake Quiz'}
                </button>
                <button
                  onClick={() => setActiveTab('lessons')}
                  className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  {isNepali ? 'पाठहरू अध्ययन गर्नुहोस्' : 'Review Lessons'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
