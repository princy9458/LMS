import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/modules/lms/models/User';
import Course from '@/modules/lms/models/Course';
import Lesson from '@/modules/lms/models/Lesson';
import Topic from '@/modules/lms/models/Topic';
import Quiz from '@/modules/lms/models/Quiz';
import Question from '@/modules/lms/models/Question';
import Certificate from '@/modules/lms/models/Certificate';

const JWT_SECRET = process.env.JWT_SECRET || 'lms_super_secret_key_2026';

const modelMap = {
  courses: Course,
  lessons: Lesson,
  topics: Topic,
  quizzes: Quiz,
  questions: Question,
  certificates: Certificate,
  users: User,
};

async function authenticateAdmin(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await dbConnect();
    const user = await User.findById(decoded.userId || decoded.id);
    if (!user || user.role !== 'admin') return null;
    return user;
  } catch (err) {
    return null;
  }
}

export async function PUT(request, { params }) {
  try {
    const { collection, id } = await params;
    const admin = await authenticateAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const Model = modelMap[collection];
    if (!Model) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const body = await request.json();
    
    // Security: Sensitive fields for users
    if (collection === 'users') {
      delete body.password;
      delete body.role; // Prevent self-demotion or unauthorized promotion via debug tool
    }

    const updated = await Model.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { collection, id } = await params;
    const admin = await authenticateAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const Model = modelMap[collection];
    if (!Model) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });

    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
