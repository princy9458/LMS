import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Quiz from '@/modules/lms/models/Quiz';
import {
  getRequestedLocale,
  hasRequiredEnglishText,
  localizeQuestionDocument,
  localizeQuizDocument,
  prepareQuizWritePayload,
} from '@/modules/lms/utils/courseLocalization';
import { resolveDocumentBySlugOrId } from '@/modules/lms/utils/slug';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const locale = getRequestedLocale(request);
    const quiz = await resolveDocumentBySlugOrId(Quiz, id, {
      populate: { path: 'questions', populate: { path: 'answers' } },
    });
    
    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 });
    }

    const normalized = localizeQuizDocument(quiz, locale);
    normalized.questions = (normalized.questions || []).map((question) => {
      const item = localizeQuestionDocument(question, locale);
      const correctAnswerIndex =
        item.correctAnswerIndex ??
        (item.answers || []).findIndex((answer) => answer.isCorrect);

      return {
        ...item,
        correctAnswerIndex: correctAnswerIndex >= 0 ? correctAnswerIndex : undefined
      };
    });

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = await params;
    const existingQuiz = await Quiz.findById(id);

    if (!existingQuiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 });
    }

    const payload = prepareQuizWritePayload({
      ...body,
      course: body.courseId || body.course,
      lesson: body.lessonId || body.lesson,
      passingMarks: body.passingMarks ?? body.passingScore,
      passingScore: body.passingScore ?? body.passingMarks
    }, existingQuiz);

    if (!hasRequiredEnglishText(payload.title)) {
      return NextResponse.json({ success: false, error: 'English title is required' }, { status: 400 });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 });
    }
    quiz.set(payload);
    await quiz.save();

    return NextResponse.json({ success: true, data: localizeQuizDocument(quiz, getRequestedLocale(request)) });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const quiz = await Quiz.findByIdAndDelete(id);
    
    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
