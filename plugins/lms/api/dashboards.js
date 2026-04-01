import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { analyticsService } from '../services/analyticsService';
import { enrollmentService } from '../services/enrollmentService';
import { requireAdmin, requireStudent } from '../middleware/authMiddleware';

export async function GET_ADMIN_DASHBOARD(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    await dbConnect();
    const stats = await analyticsService.getAdminStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET_STUDENT_DASHBOARD(request) {
  try {
    const auth = await requireStudent(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    await dbConnect();
    const enrollments = await enrollmentService.getStudentEnrollments(auth.user.userId);
    return NextResponse.json({ success: true, data: { enrollments } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
