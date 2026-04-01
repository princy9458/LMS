import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Quiz from '@/modules/lms/models/Quiz';
import QuizAttempt from '@/modules/lms/models/QuizAttempt';

export async function POST(request) {
  try {
    await dbConnect();
    const { userId, quizId, userAnswers } = await request.json();

    if (!userId || !quizId || !userAnswers) {
      return NextResponse.json({ success: false, error: 'Missing required data' }, { status: 400 });
    }

    const quiz = await Quiz.findById(quizId)
      .populate({ path: 'questions', populate: { path: 'answers' } });
    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 });
    }

    let score = 0;
    const processedAnswers = (quiz.questions || []).map((q, index) => {
      const selectedIndex = userAnswers[index];
      const correctFromAnswers = (q.answers || []).findIndex((a) => a.isCorrect);
      const correctIndex = q.correctAnswerIndex ?? (correctFromAnswers >= 0 ? correctFromAnswers : undefined);
      const isCorrect = correctIndex !== undefined && correctIndex === selectedIndex;
      if (isCorrect) score++;

      return {
        questionIndex: index,
        selectedOptionIndex: selectedIndex,
        isCorrect
      };
    });

    const passingMarks = quiz.passingMarks ?? quiz.passingScore ?? 0;
    const passed = score >= passingMarks;

    const attempt = await QuizAttempt.create({
      userId,
      quizId,
      score,
      totalQuestions: (quiz.questions || []).length,
      passed,
      answers: processedAnswers
    });

    return NextResponse.json({
      success: true,
      data: {
        score,
        total: (quiz.questions || []).length,
        passed,
        attemptId: attempt._id
      }
    });

  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
