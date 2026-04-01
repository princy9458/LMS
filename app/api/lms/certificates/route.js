import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Certificate from '@/modules/lms/models/Certificate';
import Progress from '@/modules/lms/models/Progress';
import Lesson from '@/modules/lms/models/Lesson';

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
      return NextResponse.json({ success: true, data: null });
    }

    const certificate = await Certificate.findOne({ userId, courseId });
    return NextResponse.json({ success: true, data: certificate });
  } catch (error) {
    console.error('Error fetching certificate:', error);
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
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Please provide userId and courseId' },
        { status: 400 }
      );
    }

    // Verify completion: Check if all lessons for this course are completed in the progress collection
    const [totalLessons, completedLessons] = await Promise.all([
      Lesson.countDocuments({ courseId }),
      Progress.countDocuments({ userId, courseId, completed: true })
    ]);

    if (completedLessons < totalLessons || totalLessons === 0) {
      return NextResponse.json(
        { success: false, error: 'Course not yet completed' },
        { status: 400 }
      );
    }

    // Create certificate if it doesn't already exist
    const certificate = await Certificate.findOneAndUpdate(
      { userId, courseId },
      { 
        issuedAt: new Date(),
        certificateId: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(
      { success: true, data: certificate },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    );
  }
}
