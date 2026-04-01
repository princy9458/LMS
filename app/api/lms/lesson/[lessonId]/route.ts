import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { lessonService } from '@/plugins/lms/services/lessonService';
import { requireStudent } from '@/plugins/lms/middleware/authMiddleware';
import { getRequestedLocale, localizeLessonDocument } from '@/modules/lms/utils/courseLocalization';

export async function GET(request: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const auth = await requireStudent(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { lessonId } = params;
    await dbConnect();
    const lesson = await lessonService.getLessonDetails(auth.user.userId, lessonId);
    const locale = getRequestedLocale(request) as 'en' | 'hi' | 'fr' | 'es';
    
    return NextResponse.json(localizeLessonDocument(lesson, locale));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
