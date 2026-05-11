import { dbConnect } from '@/lib/dbConnect';
import Lesson from '@/modules/lms/models/Lesson';
import { topicService } from '@/modules/lms/services/topicService';
import { badRequest, json } from '@/modules/lms/utils/api';
import mongoose from 'mongoose';
import { QUIZ_POPULATE, normalizeLessonTree } from '@/modules/lms/utils/learningTree';
import { prepareTopicWritePayload } from '@/modules/lms/utils/courseLocalization';

function isValidHttpUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeResources(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      title: String(item?.title || item?.label || '').trim(),
      url: String(item?.url || '').trim(),
    }))
    .filter((item) => item.title || item.url);
}

export async function listTopics(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get('lessonId');

  const topics = lessonId
    ? await topicService.listTopicsByLesson(lessonId)
    : await topicService.listTopics();
  const normalized = topics.map((topic) => {
    const item = topic.toObject({ virtuals: true });
    item.lessonId = item.lessonId || item.lesson;
    item.courseId = item.courseId || item.course;
    item.quizzes = Array.isArray(item.quizzes) ? item.quizzes : [];
    return item;
  });

  return json({ success: true, count: normalized.length, data: normalized });
}

export async function getTopic(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid topic ID');
  }

  const topic = await topicService.getTopicById(id);
  if (!topic) {
    return json({ success: false, error: 'Topic not found' }, 404);
  }

  const item = topic.toObject({ virtuals: true });
  item.lessonId = item.lessonId || item.lesson;
  item.quizzes = Array.isArray(item.quizzes) ? item.quizzes : [];
  return json({ success: true, data: item });
}

export async function createTopic(request) {
  await dbConnect();
  const body = await request.json();

  const lessonId = body.lessonId || body.lesson;
  if (!lessonId || !body.title) {
    return badRequest('lessonId and title are required');
  }

  let courseId = body.courseId || body.course;
  if (!courseId) {
    const lesson = await Lesson.findById(lessonId).select('course');
    courseId = lesson?.course;
  }

  const keyPoints = normalizeStringList(body.keyPoints);
  const notes = normalizeStringList(body.notes);
  const resources = normalizeResources(body.resources);
  const videoUrl = String(body.videoUrl || '').trim();
  const codeExample = String(body.codeExample || '').trim();
  const summary = body.summary;
  const description = body.description;
  const quizId = body.quizId || body.quiz || '';

  if (!isValidHttpUrl(videoUrl)) {
    return badRequest('Please provide a valid video URL');
  }
  if (resources.some((resource) => resource.url && !isValidHttpUrl(resource.url))) {
    return badRequest('Please provide valid resource URLs');
  }

  const payload = prepareTopicWritePayload({
    course: courseId,
    lesson: lessonId,
    title: body.title,
    description,
    videoUrl,
    duration: Number(body.duration || 0),
    keyPoints,
    notes,
    resources,
    codeExample,
    summary,
    translations: body.translations || {},
    quizId: quizId || undefined,
    content: body.contentHtml ?? body.content ?? '',
    contentHtml: body.contentHtml ?? body.content ?? '',
    order: Number(body.order || 0),
    quizzes: quizId ? [quizId] : [],
  });

  const topic = await topicService.createTopic(payload);
  return json({ success: true, data: topic }, 201);
}

export async function updateTopic(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid topic ID');
  }

  const body = await request.json();
  let courseId = body.courseId || body.course;
  const lessonId = body.lessonId || body.lesson;
  if (!courseId && lessonId) {
    const lesson = await Lesson.findById(lessonId).select('course');
    courseId = lesson?.course;
  }

  const keyPoints = normalizeStringList(body.keyPoints);
  const notes = normalizeStringList(body.notes);
  const resources = normalizeResources(body.resources);
  const videoUrl = String(body.videoUrl || '').trim();
  const codeExample = String(body.codeExample || '').trim();
  
  // Localized fields can be objects or strings; let prepareTopicWritePayload handle them
  const summary = body.summary;
  const description = body.description;
  const title = body.title;

  const quizId = body.quizId || body.quiz || '';

  if (!isValidHttpUrl(videoUrl)) {
    return badRequest('Please provide a valid video URL');
  }
  if (resources.some((resource) => resource.url && !isValidHttpUrl(resource.url))) {
    return badRequest('Please provide valid resource URLs');
  }

  const existingTopic = await topicService.getTopicById(id);
  if (!existingTopic) {
    return json({ success: false, error: 'Topic not found' }, 404);
  }

  const payload = prepareTopicWritePayload({
    course: courseId,
    lesson: lessonId,
    title,
    description,
    videoUrl,
    duration: Number(body.duration || 0),
    keyPoints,
    notes,
    resources,
    codeExample,
    summary,
    translations: body.translations || {},
    quizId: quizId || undefined,
    content: body.contentHtml ?? body.content ?? '',
    contentHtml: body.contentHtml ?? body.content ?? '',
    order: Number(body.order || 0),
    quizzes: quizId ? [quizId] : [],
  }, existingTopic);

  try {
    const updatedTopic = await topicService.updateTopic(id, payload);
    if (!updatedTopic) {
      return json({ success: false, error: 'Topic not found after update attempt' }, 404);
    }
    return json({ success: true, data: updatedTopic });
  } catch (err) {
    console.error('Topic Update Database Error:', err);
    return json({ 
      success: false, 
      error: 'Database operation failed', 
      message: err.message,
      details: err.errors ? Object.keys(err.errors).map(k => err.errors[k].message) : undefined
    }, 500);
  }
}

export async function deleteTopic(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const deleted = await topicService.deleteTopic(id);

  if (!deleted) {
    return json({ success: false, error: 'Topic not found' }, 404);
  }

  return json({ success: true, data: {} });
}
