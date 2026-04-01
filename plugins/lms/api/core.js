import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { lmsService } from '../services/lmsService';
import { builderService } from '../services/builderService';

// Standard error handler
const handleError = (error) => {
  console.error('API Error:', error);
  return NextResponse.json({ success: false, error: error.message }, { status: 500 });
};

// --- COURSES ---
export async function GET_COURSES(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId'); // Should come from middleware/auth normally
    await dbConnect();
    const courses = await lmsService.getQuizzes({ tenant: tenantId }); // Fallback or direct fetch
    return NextResponse.json({ success: true, data: courses });
  } catch (e) { return handleError(e); }
}

export async function CREATE_COURSE(request) {
  try {
    const body = await request.json();
    await dbConnect();
    const course = await lmsService.createCourse(body.tenantId, body);
    return NextResponse.json({ success: true, data: course });
  } catch (e) { return handleError(e); }
}

// --- LESSONS ---
export async function GET_LESSONS(request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    await dbConnect();
    const lessons = await lmsService.getLessonsByCourse(courseId);
    return NextResponse.json({ success: true, data: lessons });
  } catch (e) { return handleError(e); }
}

export async function CREATE_LESSON(request) {
  try {
    const body = await request.json();
    await dbConnect();
    const lesson = await lmsService.createLesson(body.tenantId, body);
    return NextResponse.json({ success: true, data: lesson });
  } catch (e) { return handleError(e); }
}

// --- TOPICS ---
export async function GET_TOPICS(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    await dbConnect();
    const topics = await lmsService.getTopicsByLesson(lessonId);
    return NextResponse.json({ success: true, data: topics });
  } catch (e) { return handleError(e); }
}

export async function CREATE_TOPIC(request) {
  try {
    const body = await request.json();
    await dbConnect();
    const topic = await lmsService.createTopic(body.tenantId, body);
    return NextResponse.json({ success: true, data: topic });
  } catch (e) { return handleError(e); }
}

// --- BUILDER ONLY ---
export async function GET_COURSE_STRUCTURE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const tree = await builderService.getFullTree(id);
    return NextResponse.json({ success: true, data: tree });
  } catch (e) { return handleError(e); }
}

export async function PERFORM_BULK_ACTION(request) {
  try {
    const { action, type, ids, targetId } = await request.json();
    await dbConnect();
    
    let result;
    if (action === 'delete') {
      result = await lmsService.bulkDelete(type, ids);
    } else if (action === 'move') {
      result = await lmsService.bulkMove(type, ids, targetId);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (e) { return handleError(e); }
}
