import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/modules/lms/models/User';
import Course from '@/modules/lms/models/Course';
import Job from '@/modules/lms/models/Job';
import Internship from '@/modules/lms/models/Internship';

export async function GET(request) {
  try {
    await dbConnect();

    // Gather core metrics in parallel
    const [totalStudents, totalCourses, totalJobs, totalInternships, recentEnrollments] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Job.countDocuments(),
      Internship.countDocuments(),
      User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
    ]);

    // For completion rate and skill distribution, we will use mock/aggregate data representations for the dashboard initially
    const monthlySignups = [
      { name: 'Jan', students: 400 },
      { name: 'Feb', students: 510 },
      { name: 'Mar', students: 680 },
      { name: 'Apr', students: 950 },
      { name: 'May', students: 1200 },
      { name: 'Jun', students: 1600 },
    ];

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        totalJobs,
        totalInternships,
        recentEnrollments,
        monthlySignups
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Analytics Fetch Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to aggregate analytics data.' }, { status: 500 });
  }
}
