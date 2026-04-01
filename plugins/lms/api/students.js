import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Student from '../models/Student';

export async function GET_STUDENTS(request) {
  try {
    await dbConnect();
    const students = await Student.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email image');
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET_STUDENT_BY_ID(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const student = await Student.findById(id)
      .populate('user', 'name email image')
      .populate('enrollments');
    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
