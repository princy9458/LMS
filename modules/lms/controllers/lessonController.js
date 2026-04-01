import { dbConnect } from '@/lib/dbConnect';
import { lessonService } from '@/modules/lms/services/lessonService';
import { badRequest, json } from '@/modules/lms/utils/api';
import {
  getRequestedLocale,
  hasRequiredEnglishText,
  localizeLessonDocument,
  prepareLessonWritePayload,
} from '@/modules/lms/utils/courseLocalization';
import mongoose from 'mongoose';

export async function listLessons(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const locale = getRequestedLocale(request);

  const lessons = courseId
    ? await lessonService.listLessonsByCourse(courseId)
    : await lessonService.listLessons();
  const normalized = lessons.map((lesson) => {
    const item = localizeLessonDocument(lesson, locale);
    item.courseId = item.courseId || item.course;
    item.unlockLogic = item.unlockLogic || {
      type: item.unlockType || 'none',
      daysFromEnrollment: item.unlockAfterDays || 0
    };
    return item;
  });

  return json({ success: true, count: normalized.length, data: normalized });
}

export async function getLesson(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid lesson ID');
  }

  const lesson = await lessonService.getLessonById(id);
  if (!lesson) {
    return json({ success: false, error: 'Lesson not found' }, 404);
  }

  const item = localizeLessonDocument(lesson, getRequestedLocale(request));
  item.courseId = item.courseId || item.course;
  item.unlockLogic = item.unlockLogic || {
    type: item.unlockType || 'none',
    daysFromEnrollment: item.unlockAfterDays || 0
  };

  return json({ success: true, data: item });
}

export async function createLesson(request) {
  await dbConnect();
  const body = await request.json();

  const courseId = body.courseId || body.course;
  if (!courseId || !hasRequiredEnglishText(body.title)) {
    return badRequest('courseId and English title are required');
  }

  const unlockType = body.unlockType || body.unlockLogic?.type || 'none';
  const unlockAfterDays = Number(
    body.unlockAfterDays ?? body.unlockLogic?.daysFromEnrollment ?? 0
  );

  const payload = {
    ...prepareLessonWritePayload({
      title: body.title,
      content: body.content,
      subtitles: body.subtitles,
    }),
    course: courseId,
    videoUrl: body.videoUrl,
    order: Number(body.order || 0),
    unlockType,
    unlockAfterDays
  };

  const lesson = await lessonService.createLesson(payload);
  return json({ success: true, data: localizeLessonDocument(lesson, getRequestedLocale(request)) }, 201);
}

export async function updateLesson(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid lesson ID');
  }

  const body = await request.json();
  const unlockType = body.unlockType || body.unlockLogic?.type || 'none';
  const unlockAfterDays = Number(
    body.unlockAfterDays ?? body.unlockLogic?.daysFromEnrollment ?? 0
  );

  const existingLesson = await lessonService.getLessonById(id);
  if (!existingLesson) {
    return json({ success: false, error: 'Lesson not found' }, 404);
  }

  const payload = prepareLessonWritePayload({
    course: body.courseId || body.course,
    title: body.title,
    content: body.content,
    subtitles: body.subtitles,
    videoUrl: body.videoUrl,
    order: Number(body.order || 0),
    unlockType,
    unlockAfterDays
  }, existingLesson);

  if (!hasRequiredEnglishText(payload.title)) {
    return badRequest('English title is required');
  }

  const lesson = await lessonService.updateLesson(id, payload);

  return json({ success: true, data: localizeLessonDocument(lesson, getRequestedLocale(request)) });
}

export async function deleteLesson(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid lesson ID');
  }

  const lesson = await lessonService.deleteLesson(id);
  if (!lesson) {
    return json({ success: false, error: 'Lesson not found' }, 404);
  }

  return json({ success: true, data: {} });
}
