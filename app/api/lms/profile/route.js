import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Profile from '@/modules/lms/models/Profile';
import Progress from '@/modules/lms/models/Progress';
import Course from '@/modules/lms/models/Course';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    let profile = await Profile.findOne({ userId }).populate('skills.skillId');
    
    // If no profile exists, create an empty one
    if (!profile) {
      profile = await Profile.create({ userId, skills: [] });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

// Sync profile with completed courses
export async function POST(request) {
  try {
    await dbConnect();
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // 1. Get all completed courses for the user
    // We check progress entries where completed is true
    // Note: This logic assumes we can derive course completion from progress
    const completedProgress = await Progress.find({ userId, completed: true }).distinct('courseId');
    
    // 2. Fetch all these courses to get the skillsEarned
    const completedCourses = await Course.find({ _id: { $in: completedProgress } });
    
    // 3. Aggregate unique skills
    const skillsToSet = [];
    const uniqueSkillNames = new Set();

    completedCourses.forEach(course => {
      if (course.skillsEarned) {
        course.skillsEarned.forEach(skillName => {
          if (!uniqueSkillNames.has(skillName)) {
            uniqueSkillNames.add(skillName);
            skillsToSet.push({
              name: skillName,
              level: 'beginner', // Default for now
              earnedAt: new Date()
            });
          }
        });
      }
    });

    // 4. Update or Create Profile
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          skills: skillsToSet,
          totalCoursesCompleted: completedCourses.length,
          updatedAt: new Date() 
        } 
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error syncing profile:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
