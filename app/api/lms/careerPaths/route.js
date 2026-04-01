import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import CareerPath from '@/modules/lms/models/CareerPath';

export async function GET() {
  try {
    await dbConnect();
    // Populate recommendedCourses with basic info like title and totalLessons
    const careerPaths = await CareerPath.find({}).populate('recommendedCourses', 'title totalLessons');
    return NextResponse.json({ success: true, count: careerPaths.length, data: careerPaths });
  } catch (error) {
    console.error('Error fetching career paths:', error);
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
    
    if (!body.careerName) {
      return NextResponse.json(
        { success: false, error: 'Please provide a careerName' },
        { status: 400 }
      );
    }

    const careerPath = await CareerPath.create(body);
    return NextResponse.json(
      { success: true, data: careerPath },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating career path:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    );
  }
}
