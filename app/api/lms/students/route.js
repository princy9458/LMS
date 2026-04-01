import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Student from '@/plugins/lms/models/Student';

export async function GET() {
  try {
    await dbConnect();
    const students = await Student.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error('[API] Students Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
