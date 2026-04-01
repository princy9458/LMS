import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Student from '@/plugins/lms/models/Student';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const student = await Student.findById(id)
      .populate('user', 'name email image')
      .populate('enrollments');
    
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error('[API] Student Detail Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
