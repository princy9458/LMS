import { dbConnect } from '@/lib/dbConnect';
import Quiz from '@/modules/lms/models/Quiz';
import { answerService } from '@/modules/lms/services/answerService';
import { questionService } from '@/modules/lms/services/questionService';
import { quizService } from '@/modules/lms/services/quizService';
import { badRequest, json } from '@/modules/lms/utils/api';
import {
  getRequestedLocale,
  hasRequiredEnglishText,
  localizeQuestionDocument,
  localizeQuizDocument,
  prepareQuestionWritePayload,
  prepareQuizWritePayload,
} from '@/modules/lms/utils/courseLocalization';
import mongoose from 'mongoose';

export async function listQuizzes(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get('lessonId');
  const topicId = searchParams.get('topicId');
  const locale = getRequestedLocale(request);

  if (lessonId) {
    const quiz = await Quiz.findOne({ lesson: lessonId })
      .populate({ path: 'questions', populate: { path: 'answers' } });

    if (!quiz) {
      return json({ success: true, data: null });
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

    return json({ success: true, data: normalized });
  }

  const quizzes = topicId
    ? await quizService.listQuizzes({ topic: topicId })
    : await quizService.listQuizzes();
  const normalized = quizzes.map((quiz) => localizeQuizDocument(quiz, locale));

  return json({ success: true, count: normalized.length, data: normalized });
}

export async function getQuiz(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid quiz ID');
  }

  const quiz = await quizService.getQuizById(id);
  if (!quiz) {
    return json({ success: false, error: 'Quiz not found' }, 404);
  }

  const normalized = localizeQuizDocument(quiz, getRequestedLocale(request));
  normalized.questions = (normalized.questions || []).map((question) => {
    const item = localizeQuestionDocument(question, getRequestedLocale(request));
    const correctAnswerIndex =
      item.correctAnswerIndex ??
      (item.answers || []).findIndex((answer) => answer.isCorrect);

    return {
      ...item,
      correctAnswerIndex: correctAnswerIndex >= 0 ? correctAnswerIndex : undefined
    };
  });

  return json({ success: true, data: normalized });
}

export async function createQuiz(request) {
  await dbConnect();
  const body = await request.json();

  const courseId = body.courseId || body.course;
  if (!courseId || !hasRequiredEnglishText(body.title)) {
    return badRequest('English title and courseId are required');
  }

  const payload = prepareQuizWritePayload({
    title: body.title,
    description: body.description,
    course: courseId,
    lesson: body.lessonId || body.lesson,
    topic: body.topicId || body.topic,
    passingMarks: Number(body.passingMarks || body.passingScore || 0),
    timeLimit: Number(body.timeLimit || 0),
    tenant: body.tenantId || body.tenant
  });

  const quiz = await quizService.createQuiz(payload);

  // Optional: create questions + answers in one request
  if (Array.isArray(body.questions) && body.questions.length > 0) {
    for (let index = 0; index < body.questions.length; index += 1) {
      const item = body.questions[index];
      const question = await questionService.createQuestion(prepareQuestionWritePayload({
        quiz: quiz._id,
        text: item.questionText || item.text,
        options: item.options || [],
        correctAnswerIndex: item.correctAnswerIndex,
        explanation: item.explanation,
        order: index,
        tenant: body.tenantId || body.tenant
      }));

      if (Array.isArray(item.options) && item.options.length > 0) {
        const answersPayload = item.options.map((option, optionIndex) => ({
          text: option,
          isCorrect: optionIndex === Number(item.correctAnswerIndex)
        }));

        const answers = await answerService.createAnswers(
          question._id,
          answersPayload,
          body.tenantId || body.tenant
        );
        await questionService.attachAnswers(
          question._id,
          answers.map((answer) => answer._id)
        );
      }
    }
  }

  const localizedQuiz = await quizService.getQuizById(quiz._id);
  return json({ success: true, data: localizeQuizDocument(localizedQuiz, getRequestedLocale(request)) }, 201);
}

export async function updateQuiz(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid quiz ID');
  }

  const body = await request.json();
  const existingQuiz = await quizService.getQuizById(id);
  if (!existingQuiz) {
    return json({ success: false, error: 'Quiz not found' }, 404);
  }

  const payload = prepareQuizWritePayload({
    title: body.title,
    description: body.description,
    course: body.courseId || body.course,
    lesson: body.lessonId || body.lesson,
    topic: body.topicId || body.topic,
    passingMarks: Number(body.passingMarks || body.passingScore || 0),
    timeLimit: Number(body.timeLimit || 0),
    tenant: body.tenantId || body.tenant
  }, existingQuiz);

  if (!hasRequiredEnglishText(payload.title)) {
    return badRequest('English title is required');
  }

  const quiz = await quizService.updateQuiz(id, payload);
  if (!quiz) {
    return json({ success: false, error: 'Quiz not found' }, 404);
  }

  return json({ success: true, data: localizeQuizDocument(quiz, getRequestedLocale(request)) });
}

export async function deleteQuiz(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid quiz ID');
  }

  const quiz = await quizService.deleteQuiz(id);
  if (!quiz) {
    return json({ success: false, error: 'Quiz not found' }, 404);
  }

  return json({ success: true, data: {} });
}
