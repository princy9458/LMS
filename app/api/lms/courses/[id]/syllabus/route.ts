import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { lessonService } from '@/plugins/lms/services/lessonService';
import { requireStudent } from '@/plugins/lms/middleware/authMiddleware';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireStudent(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = params;
    await dbConnect();
    const syllabus = await lessonService.getCourseSyllabus(id);
    
    return NextResponse.json(syllabus);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
