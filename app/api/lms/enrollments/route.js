import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Enrollment from '@/modules/lms/models/Enrollment';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (!body.courseId || !body.userId) {
      return NextResponse.json(
        { success: false, error: 'Please provide courseId and userId' },
        { status: 400 }
      );
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: body.userId,
      courseId: body.courseId,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'User is already enrolled in this course' },
        { status: 400 }
      );
    }

    const enrollment = await Enrollment.create(body);
    return NextResponse.json(
      { success: true, data: enrollment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    );
  }
}
