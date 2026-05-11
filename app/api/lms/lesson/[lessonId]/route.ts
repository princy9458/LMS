import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { getRequestedLocale } from '@/modules/lms/utils/courseLocalization';
import { getLessonTreeById, normalizeLessonTree } from '@/modules/lms/utils/learningTree';

export async function GET(request: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const { lessonId } = params;
    await dbConnect();
    const lesson = await getLessonTreeById(lessonId);

    if (!lesson) {
      return NextResponse.json({ success: false, error: 'Lesson not found', data: null }, { status: 404 });
    }

    const locale = getRequestedLocale(request) as 'en' | 'hi' | 'fr' | 'es';

    const normalized = normalizeLessonTree(lesson, locale);
    return NextResponse.json({ success: true, lesson: normalized, data: normalized });
  } catch (error: any) {
    console.error('Error fetching lesson detail:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error', data: null }, { status: 500 });
  }
}
