import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { courseService } from '../services/courseService';

export async function GET_ALL_COURSES(request) {
  try {
    await dbConnect();
    const courses = await courseService.getAllCourses();
    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET_COURSE_BY_ID(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const course = await courseService.getCourseById(id);
    if (!course) return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
