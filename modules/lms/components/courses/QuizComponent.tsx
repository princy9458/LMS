'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

interface QuizProps {
  quizId: string;
  title: string;
  questions: Question[];
  passingMarks: number;
  onComplete: (score: number, passed: boolean) => void;
}

export const QuizComponent: React.FC<QuizProps> = ({ quizId, title, questions, passingMarks, onComplete }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const userId = "temp-user-id"; // Mock user

  const handleSelect = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: optionIdx }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/lms/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          quizId,
          userAnswers: Object.values(selectedAnswers)
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setIsSubmitted(true);
        onComplete(data.data.score, data.data.passed);
      }
    } catch (error) {
      console.error('Quiz submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (questions.length === 0) return <div>No questions in this quiz.</div>;

  const currentQ = questions[currentQuestionIdx];

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl border bg-white shadow-xl overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-600 p-8 text-white">
        <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        <p className="text-indigo-100 text-sm mt-1 font-medium">
          Assessment • Section {currentQuestionIdx + 1} of {questions.length}
        </p>
      </div>

      <div className="p-8">
        {!isSubmitted ? (
          <>
            <div className="mb-8">
              <h4 className="text-xl font-bold text-zinc-900 mb-6">{currentQ.questionText}</h4>
              <div className="flex flex-col gap-4">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={submitting}
                    className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all font-medium ${
                      selectedAnswers[currentQuestionIdx] === idx 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'hover:border-zinc-300 border-zinc-100 text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${selectedAnswers[currentQuestionIdx] === idx ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-300 text-zinc-400'}`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      {opt}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-zinc-100">
              <button
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0 || submitting}
                className="px-6 py-3 font-bold text-zinc-500 hover:text-zinc-900 disabled:opacity-30 transition-all"
              >
                Previous
              </button>
              
              {currentQuestionIdx < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestionIdx] === undefined}
                  className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-30 transition-all"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={selectedAnswers[currentQuestionIdx] === undefined || submitting}
                  className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finish Assessment'}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              <CheckCircle size={40} />
            </div>
            <h3 className="text-3xl font-black text-zinc-900 mb-2">{result.passed ? 'Great Job!' : 'Keep Practicing'}</h3>
            <p className="text-zinc-500 font-medium text-lg mb-8">
              You scored <span className="text-zinc-900 font-bold">{result.score}/{result.total}</span> points.
            </p>
            
            <div className="space-y-4 text-left bg-zinc-50 p-6 rounded-3xl border border-zinc-100 mb-8">
               <h4 className="font-bold text-zinc-900 text-sm uppercase tracking-wider mb-2">Question Review</h4>
               {questions.map((q, idx) => (
                 <div key={idx} className="text-sm">
                   <p className="font-bold text-zinc-800">Q{idx + 1}: {q.questionText}</p>
                   {q.explanation && <p className="text-zinc-500 mt-1 italic">Note: {q.explanation}</p>}
                 </div>
               ))}
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all"
            >
              {result.passed ? 'Continue to Next Lesson' : 'Retake Quiz'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
