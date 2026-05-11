import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import {
  getRequestedLocale,
  hasRequiredEnglishCourseFields,
  localizeCourseDocument,
  prepareCourseWritePayload,
} from '@/modules/lms/utils/courseLocalization';
import Course from '@/modules/lms/models/Course';
import { getCourseTreeById, normalizeCourseTree } from '@/modules/lms/utils/learningTree';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const locale = getRequestedLocale(request);
    const previewRequested =
      request?.nextUrl?.searchParams?.get?.('preview') === '1' ||
      request?.nextUrl?.searchParams?.get?.('mode') === 'preview' ||
      request?.headers?.get?.('x-preview-course') === 'true';

    console.log('[GET /api/lms/courses/:id]', { id, previewRequested, locale });

    const course = await getCourseTreeById(id);
    console.log('[GET /api/lms/courses/:id] query result', {
      found: Boolean(course),
      isPublished: course?.isPublished,
      lessonCount: course?.lessons?.length || 0,
      populatedLessonTitles: (course?.lessons || []).map((lesson) => lesson?.title || lesson?._id || 'unknown').slice(0, 5),
    });
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const allowPreview =
      process.env.NODE_ENV !== 'production' ||
      process.env.NEXT_PUBLIC_ALLOW_UNPUBLISHED_COURSE_PREVIEW === 'true' ||
      previewRequested;

    if (!course.isPublished && !allowPreview) {
      return NextResponse.json(
        { success: false, error: 'Course is not published', data: null },
        { status: 403 }
      );
    }

    const normalized = normalizeCourseTree(course, locale);
    normalized.difficulty = normalized.difficultyLevel || normalized.level;
    console.log('[GET /api/lms/courses/:id] populated response ready', {
      lessonCount: normalized.lessons?.length || 0,
      firstLessonTitle: normalized.lessons?.[0]?.title || null,
      hasTopics: Boolean(normalized.lessons?.[0]?.topics?.length),
    });
    return NextResponse.json({ success: true, course: normalized, data: normalized });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid course ID' }, { status: 400 });
    }
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const difficultyLevel = body.difficultyLevel || body.level || body.difficulty;
    const payload = prepareCourseWritePayload({
      ...body,
      difficultyLevel,
      level: difficultyLevel
    }, existingCourse);

    if (!hasRequiredEnglishCourseFields(payload.title, payload.description)) {
      return NextResponse.json(
        { success: false, error: 'English title and description are required' },
        { status: 400 }
      );
    }
    
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    course.set(payload);
    await course.save();

    return NextResponse.json({ success: true, data: localizeCourseDocument(course, getRequestedLocale(request)) });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid course ID' }, { status: 400 });
    }
    const course = await Course.findByIdAndDelete(id);
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    );
  }
}
