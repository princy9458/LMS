import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { enrollmentService } from '../services/enrollmentService';
import { requireStudent } from '../middleware/authMiddleware';
import { EnrollmentSchema } from '../validation/lmsSchemas';

export async function ENROLL_STUDENT(request) {
  try {
    const auth = await requireStudent(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const validated = EnrollmentSchema.parse(body);

    await dbConnect();
    const enrollment = await enrollmentService.enrollStudent(auth.user.userId, validated.courseId);
    
    return NextResponse.json({ success: true, data: enrollment });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
