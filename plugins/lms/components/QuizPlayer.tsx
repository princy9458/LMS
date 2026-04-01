'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Trophy, HelpCircle, ArrowRight, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const QuizPlayer = ({ quiz, onFinish }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const questions = quiz?.questions || [];
  const currentQuestion = questions[currentQuestionIdx];

  const handleSelect = (option) => {
    setAnswers({ ...answers, [currentQuestion._id]: option });
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    // Mock result calculation
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q._id] === q.correctAnswer) correctCount++;
    });
    
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= (quiz.passingScore || 80);
    
    setResult({ score, passed, correctCount, total: questions.length });
    setSubmitted(true);
    if (onFinish) onFinish({ score, passed });
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto border-none shadow-2xl overflow-hidden mt-10">
        <div className={cn(
          "p-12 text-center",
          result.passed ? "bg-green-500/10" : "bg-destructive/10"
        )}>
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-background shadow-lg">
            {result.passed ? (
              <Trophy className="text-amber-500" size={40} />
            ) : (
              <XCircle className="text-destructive" size={40} />
            )}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {result.passed ? "Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold">
            Your Final Score
          </p>
          <div className="text-6xl font-black mt-2 mb-6">
            {result.score}%
          </div>
          <p className="font-medium">
            You got {result.correctCount} out of {result.total} questions correct.
          </p>
        </div>
        <CardFooter className="p-8 flex justify-center gap-4">
          <Button variant="outline" className="rounded-full px-8" onClick={() => window.location.reload()}>
            <RefreshCcw size={18} className="mr-2" /> Retake Quiz
          </Button>
          {result.passed && (
            <Button className="rounded-full px-8">
              Continue Learning <ArrowRight size={18} className="ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{quiz.title}</h2>
          <p className="text-sm text-muted-foreground font-medium">Question {currentQuestionIdx + 1} of {questions.length}</p>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 w-8 rounded-full transition-all",
                i === currentQuestionIdx ? "bg-primary w-12" : i < currentQuestionIdx ? "bg-primary/40" : "bg-muted"
              )} 
            />
          ))}
        </div>
      </div>

      <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm overflow-hidden ring-1 ring-muted">
        <CardHeader className="p-8 bg-muted/20">
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <HelpCircle size={22} />
            </div>
            <CardTitle className="text-xl leading-relaxed font-semibold pt-1">
              {currentQuestion.text}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <RadioGroup 
            value={answers[currentQuestion._id]} 
            onValueChange={handleSelect}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, idx) => (
              <Label
                key={idx}
                className={cn(
                  "flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-muted/50",
                  answers[currentQuestion._id] === option 
                    ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" 
                    : "border-muted"
                )}
              >
                <div className="p-1">
                  <RadioGroupItem value={option} id={`opt-${idx}`} className="sr-only" />
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    answers[currentQuestion._id] === option ? "border-primary bg-primary" : "border-muted-foreground/30"
                  )}>
                    {answers[currentQuestion._id] === option && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
                <span className="text-base font-medium flex-1">{option}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="p-8 pt-0 flex justify-between items-center">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Required: {quiz.passingScore}% to pass
          </p>
          <Button 
            disabled={!answers[currentQuestion._id]} 
            onClick={handleNext} 
            className="rounded-full px-8 gap-2 font-bold"
          >
            {currentQuestionIdx === questions.length - 1 ? "Finish Quiz" : "Next Question"} 
            <ArrowRight size={18} />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizPlayer;
