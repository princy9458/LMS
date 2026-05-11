import { dbConnect } from '@/lib/dbConnect';
import { courseService } from '@/modules/lms/services/courseService';
import { badRequest, json, normalizeStringArray } from '@/modules/lms/utils/api';
import {
  getRequestedLocale,
  hasRequiredEnglishCourseFields,
  localizeCourseDocument,
  prepareCourseWritePayload,
} from '@/modules/lms/utils/courseLocalization';
import mongoose from 'mongoose';
import { normalizeCourseTree } from '@/modules/lms/utils/learningTree';

export async function listCourses(request) {
  await dbConnect();
  const locale = getRequestedLocale(request);
  const courses = await courseService.listCourses();
  return json({
    success: true,
    count: courses.length,
    data: courses.map((course) => localizeCourseDocument(course, locale)),
  });
}

export async function getCourse(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const locale = getRequestedLocale(request);

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid course ID');
  }

  const course = await courseService.getCourseById(id);
  if (!course) {
    return json({ success: false, error: 'Course not found' }, 404);
  }

  return json({ success: true, data: normalizeCourseTree(course, locale) });
}

export async function createCourse(request) {
  await dbConnect();
  const body = await request.json();

  if (!hasRequiredEnglishCourseFields(body.title, body.description)) {
    return badRequest('English title and description are required');
  }

  const missing = [];
  if (!body.category) missing.push('category');
  if (!body.instructorName) missing.push('instructorName');

  if (missing.length) {
    return badRequest(`Missing required fields: ${missing.join(', ')}`);
  }

  const difficultyLevel = body.difficultyLevel || body.level || body.difficulty;
  const payload = prepareCourseWritePayload({
    title: body.title,
    description: body.description,
    category: body.category,
    instructorName: body.instructorName,
    instructor: body.instructorId || body.instructor,
    thumbnail: body.thumbnail,
    difficultyLevel,
    level: difficultyLevel,
    skillsEarned: normalizeStringArray(body.skillsEarned),
    totalLessons: Number(body.totalLessons || 0)
  });

  const course = await courseService.createCourse(payload);
  return json({ success: true, data: localizeCourseDocument(course, getRequestedLocale(request)) }, 201);
}

export async function updateCourse(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid course ID');
  }

  const body = await request.json();
  const difficultyLevel = body.difficultyLevel || body.level || body.difficulty;
  const existingCourse = await courseService.getCourseById(id);
  if (!existingCourse) {
    return json({ success: false, error: 'Course not found' }, 404);
  }

  const payload = prepareCourseWritePayload({
    ...body,
    difficultyLevel,
    level: difficultyLevel,
    skillsEarned: normalizeStringArray(body.skillsEarned)
  }, existingCourse);

  if (!hasRequiredEnglishCourseFields(payload.title, payload.description)) {
    return badRequest('English title and description are required');
  }

  const course = await courseService.updateCourse(id, payload);

  return json({ success: true, data: localizeCourseDocument(course, getRequestedLocale(request)) });
}

export async function deleteCourse(request, { params }) {
  await dbConnect();
  const { id } = await params;

  if (!id) {
    return badRequest('Missing ID');
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return badRequest('Invalid course ID');
  }

  const course = await courseService.deleteCourse(id);
  if (!course) {
    return json({ success: false, error: 'Course not found' }, 404);
  }

  return json({ success: true, data: {} });
}
