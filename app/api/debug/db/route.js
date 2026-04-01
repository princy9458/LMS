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

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      await dbConnect();
      const adminUser = await User.findById(userId);

      if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Access denied. Admins only.' }, { status: 403 });
      }

      // Fetch data from collections with a limit for performance
      const [courses, lessons, topics, quizzes, questions, certificates, users] = await Promise.all([
        Course.find().limit(50).lean(),
        Lesson.find().limit(50).lean(),
        Topic.find().limit(50).lean(),
        Quiz.find().limit(50).lean(),
        Question.find().limit(50).lean(),
        Certificate.find().limit(50).lean(),
        User.find().limit(50).select('-password').lean() // Security: Don't show password hashes
      ]);

      return NextResponse.json({
        success: true,
        data: {
          courses,
          lessons,
          topics,
          quizzes,
          questions,
          certificates,
          users
        },
        counts: {
          courses: courses.length,
          lessons: lessons.length,
          topics: topics.length,
          quizzes: quizzes.length,
          questions: questions.length,
          certificates: certificates.length,
          users: users.length
        }
      });
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Auth session expired' }, { status: 401 });
    }
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
