import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Lesson from '@/modules/lms/models/Lesson';
import {
  getRequestedLocale,
  localizeLessonDocument,
  prepareLessonWritePayload,
} from '@/modules/lms/utils/courseLocalization';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    const normalized = localizeLessonDocument(lesson, getRequestedLocale(request));
    normalized.courseId = normalized.courseId || normalized.course;
    normalized.unlockLogic = normalized.unlockLogic || {
      type: normalized.unlockType || 'none',
      daysFromEnrollment: normalized.unlockAfterDays || 0
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = await params;
    const existingLesson = await Lesson.findById(id);
    if (!existingLesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    const payload = prepareLessonWritePayload({
      ...body,
      course: body.courseId || body.course,
      unlockType: body.unlockType || body.unlockLogic?.type,
      unlockAfterDays: body.unlockAfterDays ?? body.unlockLogic?.daysFromEnrollment
    }, existingLesson);
    
    const lesson = await Lesson.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ success: true, data: localizeLessonDocument(lesson, getRequestedLocale(request)) });
  } catch (error) {
    console.error('Error updating lesson:', error);
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
    const lesson = await Lesson.findByIdAndDelete(id);
    
    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    );
  }
}
