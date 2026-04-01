import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Skill from '@/modules/lms/models/Skill';

export async function GET() {
  try {
    await dbConnect();
    const skills = await Skill.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, count: skills.length, data: skills });
  } catch (error) {
    console.error('Error fetching skills:', error);
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
    
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Please provide a skill name' },
        { status: 400 }
      );
    }

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ name: { $regex: new RegExp(`^${body.name}$`, 'i') } });
    if (existingSkill) {
      return NextResponse.json(
        { success: false, error: 'Skill already exists' },
        { status: 400 }
      );
    }

    const skill = await Skill.create(body);
    return NextResponse.json(
      { success: true, data: skill },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { success: false, error: 'Server Error' },
      { status: 500 }
    );
  }
}
