import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import Course from '@/modules/lms/models/Course';
import Job from '@/modules/lms/models/Job';
import Internship from '@/modules/lms/models/Internship';

export async function GET() {
  try {
    await dbConnect();
    
    // Clear existing
    await Course.deleteMany({});
    await Job.deleteMany({});
    await Internship.deleteMany({});

    // Sample data
    const sampleCourses = [
      {
        title: 'Advanced React Native',
        description: 'Learn to build cross-platform mobile apps with React Native and Expo.',
        instructorId: new mongoose.Types.ObjectId(),
        totalLessons: 12,
        skillsEarned: ['React Native', 'Mobile Development', 'JavaScript'],
      },
      {
        title: 'Fullstack Next.js Development',
        description: 'Master server-side rendering, API routes, and database integration with Next.js.',
        instructorId: new mongoose.Types.ObjectId(),
        totalLessons: 15,
        skillsEarned: ['Next.js', 'React', 'MongoDB'],
      },
      {
        title: 'UI/UX Design Fundamentals',
        description: 'Learn the principles of user interface and user experience design.',
        instructorId: new mongoose.Types.ObjectId(),
        totalLessons: 8,
        skillsEarned: ['Figma', 'UI Design', 'UX Research'],
      }
    ];

    const sampleJobs = [
      {
        title: 'Senior Frontend Engineer',
        company: 'TechCorp Inc.',
        location: 'Remote',
        requiredSkills: ['React', 'Next.js', 'TypeScript'],
        salaryRange: '$120k - $150k',
        postedAt: new Date()
      },
      {
        title: 'Mobile App Developer',
        company: 'AppWorks',
        location: 'New York, NY',
        requiredSkills: ['React Native', 'JavaScript', 'Mobile Development'],
        salaryRange: '$100k - $130k',
        postedAt: new Date()
      }
    ];

    const sampleInternships = [
      {
        title: 'Frontend Web Intern',
        company: 'StartupX',
        duration: '3 Months',
        stipend: '$2,000/month',
        requiredSkills: ['React', 'HTML', 'CSS'],
        postedAt: new Date()
      },
      {
        title: 'Product Design Intern',
        company: 'CreativeLab',
        duration: '6 Months',
        stipend: '$1,500/month',
        requiredSkills: ['UI Design', 'Figma'],
        postedAt: new Date()
      }
    ];

    await Course.insertMany(sampleCourses);
    await Job.insertMany(sampleJobs);
    await Internship.insertMany(sampleInternships);

    return NextResponse.json({ success: true, message: 'Database seeded successfully!' });
  } catch (error) {
    console.error('Error seeding:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
