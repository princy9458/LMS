import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Profile from '@/modules/lms/models/Profile';
import Job from '@/modules/lms/models/Job';
import Internship from '@/modules/lms/models/Internship';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // 1. Get User Profile
    const profile = await Profile.findOne({ userId });
    if (!profile || !profile.skills || profile.skills.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: { jobs: [], internships: [] },
        message: 'No skills found in profile. Complete courses to get matches.'
      });
    }

    const userSkillNames = profile.skills.map(s => s.name.toLowerCase());

    // 2. Fetch Jobs and Internships that match at least one skill
    // In a real app, we'd use a more sophisticated scoring algorithm
    const [jobs, internships] = await Promise.all([
      Job.find({
        requiredSkills: { $in: userSkillNames.map(name => new RegExp(`^${name}$`, 'i')) }
      }).limit(5),
      Internship.find({
        requiredSkills: { $in: userSkillNames.map(name => new RegExp(`^${name}$`, 'i')) }
      }).limit(5)
    ]);

    // 3. Mark which skills match for each item
    const enrichMatches = (items) => items.map(item => {
      const matchCount = item.requiredSkills.filter(s => userSkillNames.includes(s.toLowerCase())).length;
      return {
        ...item.toObject(),
        matchScore: matchCount, // Simple score based on number of matching skills
        matchedSkills: item.requiredSkills.filter(s => userSkillNames.includes(s.toLowerCase()))
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ 
      success: true, 
      data: { 
        jobs: enrichMatches(jobs), 
        internships: enrichMatches(internships) 
      } 
    });

  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
