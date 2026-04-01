import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { progressService } from '@/plugins/lms/services/progressService';
import { requireStudent } from '@/plugins/lms/middleware/authMiddleware';

export async function POST(request: Request) {
  try {
    const auth = await requireStudent(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { courseId, lessonId, status } = await request.json();
    
    await dbConnect();
    const progress = await progressService.updateProgress(auth.user.userId, courseId, lessonId, status);
    
    // Check for next lesson if auto-next is desired
    const nextLesson = await progressService.getNextLesson(courseId, lessonId);

    return NextResponse.json({
      progress,
      nextLessonId: nextLesson?._id
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
