import mongoose from 'mongoose';
import Course from '@/plugins/lms/models/Course';
import Lesson from '@/plugins/lms/models/Lesson';
import Topic from '@/plugins/lms/models/Topic';
import Question from '@/plugins/lms/models/Question';
import Answer from '@/plugins/lms/models/Answer';
import Enrollment from '@/plugins/lms/models/Enrollment';
import Progress from '@/modules/lms/models/Progress.js';
import Quiz from '@/plugins/lms/models/Quiz';
import Certificate from '@/modules/lms/models/Certificate.js';
import Job from '@/plugins/lms/models/Job';
import Internship from '@/plugins/lms/models/Internship';
import CareerPath from '@/modules/lms/models/CareerPath.js';
import Skill from '@/modules/lms/models/Skill.js';
import Employer from '@/plugins/lms/models/Employer';
import User from '@/modules/lms/models/User.js';
import Student from '@/plugins/lms/models/Student';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'lms_core';
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let adminVerified = false;
let dataSeeded = false;

async function ensureAdminIntegrity() {
  if (adminVerified) return;
  
  try {
    const adminEmail = 'admin@lms.com';
    const adminExists = await User.findOne({ email: adminEmail }).select('+password');
    
    if (!adminExists) {
      if (isDev) console.log('[SEEDER] Creating Default Admin...');
      await User.create({
        name: 'LMS Administrator',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin'
      });
      if (isDev) console.log('[SEEDER] Admin Created.');
    } else {
      if (isDev) console.log(`[SEEDER] Verifying Admin: ${adminEmail}`);
      let updated = false;
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        updated = true;
      }
      
      const isMatch = await bcrypt.compare('Admin@123', adminExists.password || '');
      if (!isMatch) {
        if (isDev) console.log('[SEEDER] Password mismatch detected. Resetting admin password.');
        adminExists.password = 'Admin@123';
        updated = true;
      }

      if (updated) {
        await adminExists.save();
        if (isDev) console.log('[SEEDER] Admin Integrity Restored.');
      } else {
        if (isDev) console.log('[SEEDER] Admin Integrity Verified.');
      }
    }
    adminVerified = true;
  } catch (err) {
    console.error('[SEEDER] Integrity Check Failed:', err);
  }
}

async function seedSampleDataIfEmpty() {
  if (dataSeeded) return;

  const courseCount = await Course.countDocuments();
  if (courseCount > 0) {
    dataSeeded = true;
    return;
  }

  try {
    if (isDev) console.log('[SEED] Seeding initial LMS data...');

    const course = await Course.create({
      title: 'AI & Machine Learning',
      description: 'Learn the fundamentals of AI, machine learning, and real-world applications.',
      category: 'Software Engineering',
      instructorName: 'Admin',
      difficultyLevel: 'Beginner',
      skillsEarned: ['AI Fundamentals', 'Machine Learning', 'Data Science']
    });

    const lesson = await Lesson.create({
      course: course._id,
      title: 'Introduction to AI',
      content: 'Understand what AI is and where it is used.',
      order: 1
    });

    await Course.findByIdAndUpdate(
      course._id,
      { $addToSet: { lessons: lesson._id }, $inc: { totalLessons: 1 } },
      { new: true }
    );

    const topic = await Topic.create({
      course: course._id,
      lesson: lesson._id,
      title: 'What is AI?',
      content: 'A brief history and definition of artificial intelligence.',
      order: 1
    });

    await Lesson.findByIdAndUpdate(
      lesson._id,
      { $addToSet: { topics: topic._id } },
      { new: true }
    );

    const quiz = await Quiz.create({
      course: course._id,
      lesson: lesson._id,
      topic: topic._id,
      title: 'AI Basics Quiz',
      description: 'Test your understanding of basic AI concepts.',
      totalPoints: 5,
      order: 1
    });

    await Topic.findByIdAndUpdate(
      topic._id,
      { $addToSet: { quizzes: quiz._id } },
      { new: true }
    );
    await Lesson.findByIdAndUpdate(
      lesson._id,
      { $addToSet: { quizzes: quiz._id } },
      { new: true }
    );

    const question = await Question.create({
      quiz: quiz._id,
      text: 'What does AI stand for?',
      type: 'single',
      points: 1,
      options: ['Artificial Intelligence', 'Automated Interaction', 'Applied Innovation', 'Advanced Internet'],
      correctAnswerIndex: 0,
      order: 1
    });

    await Quiz.findByIdAndUpdate(
      quiz._id,
      { $addToSet: { questions: question._id } },
      { new: true }
    );

    await Certificate.create({
      name: 'AI Completion Certificate',
      description: 'Awarded for completing the AI & Machine Learning course.',
      courseId: course._id
    });

    if (isDev) console.log('[SEED] Sample LMS data created.');
    dataSeeded = true;
  } catch (error) {
    console.error('[SEED] Failed to seed LMS data:', error);
  }
}

async function connectDB() {
  if (!MONGODB_URI) {
    if (isDev) {
      console.warn('[DB] MONGODB_URI is missing. Please set it in your environment variables.');
    }
    throw new Error('Missing MONGODB_URI environment variable');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      dbName: MONGODB_DB_NAME,
    };

    if (isDev) console.log('[DB] Connecting to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      // Ensure collections are implicitly and explicitly created upon the first connection
      const models = [
        Course, Lesson, Topic, Question, Answer,
        Enrollment, Progress, Quiz, Certificate,
        Job, Internship, CareerPath, Skill, Employer, Student
      ];
      
      for (const model of models) {
        await model.createCollection().catch(e => {
          // code 48 is NamespaceExists which means collection already exists
          if (e.code !== 48) {
            console.error(`Error creating collection for ${model.modelName}:`, e);
          }
        });
      }
      
      if (isDev) console.log('[DB] MongoDB connected.');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    // Always run integrity check after connection, it will early return if already verified
    await ensureAdminIntegrity();
    await seedSampleDataIfEmpty();
  } catch (e) {
    if (isDev) {
      console.error('[DB] Connection error:', e);
    } else {
      console.error('[DB] Connection error.');
    }
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
