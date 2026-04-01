import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { enrollmentService } from '@/plugins/lms/services/enrollmentService';
import { requireStudent } from '@/plugins/lms/middleware/authMiddleware';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireStudent(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = params;
    await dbConnect();
    const enrollment = await enrollmentService.getEnrollment(auth.user.userId, id);
    
    if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 404 });

    return NextResponse.json(enrollment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
