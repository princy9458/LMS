import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Progress from '@/modules/lms/models/Progress';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');

    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Please provide userId and courseId parameters' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const progressRecords = await Progress.find({ userId, courseId });
    return NextResponse.json({ success: true, data: progressRecords });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (!body.userId || !body.courseId || !body.lessonId || typeof body.completed !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Please provide userId, courseId, lessonId, and completed status' },
        { status: 400 }
      );
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: body.userId, courseId: body.courseId, lessonId: body.lessonId },
      { 
        completed: body.completed,
        completedAt: body.completed ? new Date() : null
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(
      { success: true, data: progress },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    );
  }
}
