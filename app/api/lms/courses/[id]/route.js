import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Course from '@/modules/lms/models/Course';
import {
  getRequestedLocale,
  hasRequiredEnglishCourseFields,
  localizeCourseDocument,
  prepareCourseWritePayload,
} from '@/modules/lms/utils/courseLocalization';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const locale = getRequestedLocale(request);
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing course ID' }, { status: 400 });
    }

    const course = await Course.findById(id);
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const normalized = localizeCourseDocument(course, locale);
    normalized.difficulty = normalized.difficultyLevel || normalized.level;
    return NextResponse.json({ success: true, data: normalized });
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
    
    const course = await Course.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

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
