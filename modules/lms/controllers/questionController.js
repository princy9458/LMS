import { dbConnect } from '@/lib/dbConnect';
import { answerService } from '@/modules/lms/services/answerService';
import { questionService } from '@/modules/lms/services/questionService';
import { badRequest, json } from '@/modules/lms/utils/api';
import {
  getRequestedLocale,
  hasRequiredEnglishText,
  localizeQuestionDocument,
  prepareQuestionWritePayload,
} from '@/modules/lms/utils/courseLocalization';
import mongoose from 'mongoose';

export async function listQuestions(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get('quizId');
  const locale = getRequestedLocale(request);

  const questions = quizId
    ? await questionService.listQuestionsByQuiz(quizId)
    : await questionService.listQuestions();
  const normalized = questions.map((question) => localizeQuestionDocument(question, locale));

  return json({ success: true, count: normalized.length, data: normalized });
}

export async function getQuestion(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid question ID');
  }

  const question = await questionService.getQuestionById(id);
  if (!question) {
    return json({ success: false, error: 'Question not found' }, 404);
  }

  const item = localizeQuestionDocument(question, getRequestedLocale(request));
  item.correctAnswerIndex =
    item.correctAnswerIndex ??
    (item.answers || []).findIndex((answer) => answer.isCorrect);

  return json({ success: true, data: item });
}

export async function createQuestion(request) {
  await dbConnect();
  const body = await request.json();

  const quizId = body.quizId || body.quiz;
  if (!quizId || !hasRequiredEnglishText(body.text || body.questionText)) {
    return badRequest('quizId and English text are required');
  }

  const questionPayload = prepareQuestionWritePayload({
    quiz: quizId,
    text: body.text || body.questionText,
    type: body.type || 'single',
    points: Number(body.points || 1),
    options: body.options || [],
    correctAnswerIndex: body.correctAnswerIndex,
    explanation: body.explanation,
    tags: body.tags || [],
    order: Number(body.order || 0),
    tenant: body.tenantId || body.tenant
  });
  const question = await questionService.createQuestion(questionPayload);

  if (Array.isArray(body.answers) && body.answers.length > 0) {
    const answers = await answerService.createAnswers(
      question._id,
      body.answers,
      body.tenantId || body.tenant
    );

    await questionService.attachAnswers(
      question._id,
      answers.map((answer) => answer._id)
    );
  }

  const localizedQuestion = await questionService.getQuestionById(question._id);
  return json({ success: true, data: localizeQuestionDocument(localizedQuestion, getRequestedLocale(request)) }, 201);
}

export async function updateQuestion(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid question ID');
  }

  const body = await request.json();
  const quizId = body.quizId || body.quiz;
  if (!quizId || !hasRequiredEnglishText(body.text || body.questionText)) {
    return badRequest('quizId and English text are required');
  }

  const existingQuestion = await questionService.getQuestionById(id);
  if (!existingQuestion) {
    return json({ success: false, error: 'Question not found' }, 404);
  }

  const question = await questionService.updateQuestion(id, prepareQuestionWritePayload({
    quiz: quizId,
    text: body.text || body.questionText,
    type: body.type || 'single',
    points: Number(body.points || 1),
    options: body.options || [],
    correctAnswerIndex: body.correctAnswerIndex,
    explanation: body.explanation,
    tags: body.tags || [],
    order: Number(body.order || 0),
    tenant: body.tenantId || body.tenant
  }, existingQuestion));

  if (Array.isArray(body.answers)) {
    const answers = await answerService.createAnswers(
      question._id,
      body.answers,
      body.tenantId || body.tenant
    );
    await questionService.attachAnswers(
      question._id,
      answers.map((answer) => answer._id)
    );
  }

  const localizedQuestion = await questionService.getQuestionById(id);
  return json({ success: true, data: localizeQuestionDocument(localizedQuestion, getRequestedLocale(request)) });
}

export async function deleteQuestion(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const deleted = await questionService.deleteQuestion(id);

  if (!deleted) {
    return json({ success: false, error: 'Question not found' }, 404);
  }

  return json({ success: true, data: {} });
}
