import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { getCourseTreeById, normalizeCourseTree } from '@/modules/lms/utils/learningTree';
import { getRequestedLocale } from '@/modules/lms/utils/courseLocalization';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid course ID', data: null }, { status: 400 });
    }
    await dbConnect();
    const course = await getCourseTreeById(id);
    console.log('[GET /api/lms/courses/:id/syllabus]', { id, found: Boolean(course), isPublished: course?.isPublished });

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found', data: null }, { status: 404 });
    }

    const nextUrl = (request as Request & { nextUrl?: URL }).nextUrl;
    const allowPreview =
      process.env.NODE_ENV !== 'production' ||
      process.env.NEXT_PUBLIC_ALLOW_UNPUBLISHED_COURSE_PREVIEW === 'true' ||
      request.headers.get('x-preview-course') === 'true' ||
      nextUrl?.searchParams?.get('preview') === '1';

    if (!course.isPublished && !allowPreview) {
      return NextResponse.json({ success: false, error: 'Course is not published', data: null }, { status: 403 });
    }

    const locale = getRequestedLocale(request);
    const syllabus = normalizeCourseTree(course, locale);

    return NextResponse.json({ success: true, course: syllabus, data: [syllabus] });
  } catch (error: any) {
    console.error('Error fetching syllabus:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error', data: null }, { status: 500 });
  }
}
