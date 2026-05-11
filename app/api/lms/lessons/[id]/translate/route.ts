import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Lesson from '@/modules/lms/models/Lesson';
import {
  getRequestedLocale,
  localizeLessonDocument,
  normalizeLocalizedField,
  prepareLessonWritePayload,
} from '@/modules/lms/utils/courseLocalization';
import { translateLessonContent } from '@/modules/lms/utils/lessonTranslation';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const targetLocale = typeof body?.targetLocale === 'string' ? body.targetLocale : getRequestedLocale(request);
    const persist = body?.persist !== false;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }
    const normalizedTitle = normalizeLocalizedField(lesson.title);

    if (normalizedTitle[targetLocale]) {
      return NextResponse.json({
        success: true,
        data: localizeLessonDocument(lesson, targetLocale),
        translated: false,
        persisted: false,
      });
    }

    const translatedTitle = await translateLessonContent({
      content: lesson.title,
      targetLocale,
    });

    if (!persist) {
      const localizedLesson = localizeLessonDocument(
        {
          ...lesson.toObject({ virtuals: true }),
          title: {
            ...normalizedTitle,
            [targetLocale]: translatedTitle,
          },
        },
        targetLocale
      );

      return NextResponse.json({ success: true, data: localizedLesson, translated: true, persisted: false });
    }

    const payload = prepareLessonWritePayload(
      {
        title: {
          [targetLocale]: translatedTitle,
        },
      },
      lesson
    );

    const updatedLesson = await Lesson.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      data: localizeLessonDocument(updatedLesson, targetLocale),
      translated: true,
      persisted: true,
    });
  } catch (error: any) {
    console.error('Error translating lesson:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}
