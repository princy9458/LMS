import { dbConnect } from '@/lib/dbConnect';
import Lesson from '@/modules/lms/models/Lesson';
import { topicService } from '@/modules/lms/services/topicService';
import { badRequest, json } from '@/modules/lms/utils/api';
import mongoose from 'mongoose';

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

  const payload = {
    course: courseId,
    lesson: lessonId,
    title: body.title,
    content: body.content,
    order: Number(body.order || 0)
  };

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

  const payload = {
    course: courseId,
    lesson: lessonId,
    title: body.title,
    content: body.content,
    order: Number(body.order || 0)
  };

  const topic = await topicService.updateTopic(id, payload);
  if (!topic) {
    return json({ success: false, error: 'Topic not found' }, 404);
  }

  return json({ success: true, data: topic });
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
