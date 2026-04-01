const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Models (Using the new plugin models - we'll use require for compatibility with standalone script)
// Note: We need to point to the built/transpiled models if running in TS, 
// but for a seeder we can define them locally or use the TS files with ts-node if available.
// However, since we are in a JS context for this script, I will define the schemas locally 
// or point to the existing ones if they are plain JS. 
// The user asked for plugins/lms/models to be created. I created them as .ts.
// I will use a minimal schema definition inside the script to ensure it runs without TS overhead.

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'lms_core';

async function seed() {
  try {
    console.log('--- LMS Seeder: Connecting... ---');
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
    console.log('Connected.');

    const rawData = fs.readFileSync(path.join(__dirname, '../docs/lms-plugin/seed-data.json'), 'utf8');
    const data = JSON.parse(rawData);

    // Dynamic Models
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ email: String, role: String, name: String, password: { type: String, select: false } }));
    const Course = mongoose.models.Course || mongoose.model('Course', new mongoose.Schema({ title: String, slug: String, instructor: mongoose.Schema.Types.ObjectId, modules: [mongoose.Schema.Types.ObjectId] }, { timestamps: true }));
    const Module = mongoose.models.Module || mongoose.model('Module', new mongoose.Schema({ title: String, course: mongoose.Schema.Types.ObjectId, lessons: [mongoose.Schema.Types.ObjectId] }));
    const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', new mongoose.Schema({ title: String, module: mongoose.Schema.Types.ObjectId, quizzes: [mongoose.Schema.Types.ObjectId], type: String, content: String }));
    const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', new mongoose.Schema({ title: String, lesson: mongoose.Schema.Types.ObjectId, questions: [mongoose.Schema.Types.ObjectId] }));
    const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({ quiz: mongoose.Schema.Types.ObjectId, text: String, options: [String], correctAnswer: String }));
    const Employer = mongoose.models.Employer || mongoose.model('Employer', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, companyName: String, jobs: [mongoose.Schema.Types.ObjectId] }));
    const Job = mongoose.models.Job || mongoose.model('Job', new mongoose.Schema({ title: String, employer: mongoose.Schema.Types.ObjectId, location: String, salaryRange: String }));
    const Student = mongoose.models.Student || mongoose.model('Student', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, skillTags: [String] }));

    // 1. Get Admin User
    const admin = await User.findOne({ email: 'admin@lms.com' });
    if (!admin) throw new Error('Admin user not found. Run admin seeder first.');

    console.log(`Using Instructor: ${admin.email}`);

    // 2. Seed Courses
    for (const cData of data.courses) {
      console.log(`Seeding Course: ${cData.title}`);
      
      let course = await Course.findOne({ slug: cData.slug });
      if (!course) {
        course = await Course.create({
          title: cData.title,
          slug: cData.slug,
          description: cData.description,
          price: cData.price,
          category: cData.category,
          level: cData.level,
          instructor: admin._id
        });
      }

      const moduleIds = [];
      for (const mData of cData.sections) {
        console.log(`  Seeding Module: ${mData.title}`);
        let module = await Module.create({
          title: mData.title,
          course: course._id
        });
        moduleIds.push(module._id);

        const lessonIds = [];
        for (const lData of mData.lessons) {
          console.log(`    Seeding Lesson: ${lData.title}`);
          let lesson = await Lesson.create({
            title: lData.title,
            module: module._id,
            type: lData.type,
            content: lData.content,
            duration: lData.duration
          });
          lessonIds.push(lesson._id);
        }
        
        // Update Module with Lessons
        await Module.updateOne({ _id: module._id }, { $set: { lessons: lessonIds } });

        // Seed Quizzes if any
        if (mData.quizzes) {
          for (const qData of mData.quizzes) {
            console.log(`      Seeding Quiz: ${qData.title}`);
            const lastLesson = lessonIds[lessonIds.length - 1];
            let quiz = await Quiz.create({
              title: qData.title,
              lesson: lastLesson,
              passingScore: qData.passingScore
            });

            const questionIds = [];
            for (const quest of qData.questions) {
              let question = await Question.create({
                quiz: quiz._id,
                text: quest.text,
                options: quest.options,
                correctAnswer: quest.correctAnswer,
                explanation: quest.explanation
              });
              questionIds.push(question._id);
            }
            await Quiz.updateOne({ _id: quiz._id }, { $set: { questions: questionIds } });
            await Lesson.updateOne({ _id: lastLesson }, { $push: { quizzes: quiz._id } });
          }
        }
      }
      await Course.updateOne({ _id: course._id }, { $set: { modules: moduleIds } });
    }

    // 3. Seed Employer & Jobs
    console.log('Seeding Employer and Jobs...');
    const employerUser = await User.findOne({ email: 'employer@lms.com' });
    let empUserId = employerUser ? employerUser._id : null;
    
    if (!empUserId) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Employer@123', salt);
      const newEmp = await User.create({
        name: 'TechStream HR',
        email: 'employer@lms.com',
        password: hashedPassword,
        role: 'employer'
      });
      empUserId = newEmp._id;
    }

    let employer = await Employer.findOne({ user: empUserId });
    if (!employer) {
      employer = await Employer.create({
        user: empUserId,
        companyName: 'TechStream Systems',
        industry: 'Software',
        isVerified: true
      });
    }

    const jobIds = [];
    for (const jData of data.opportunities.jobs) {
      console.log(`  Seeding Job: ${jData.title}`);
      let job = await Job.create({
        title: jData.title,
        employer: employer._id,
        description: `Opportunity at ${jData.company}`,
        salaryRange: jData.salary,
        location: jData.location,
        requirements: jData.requirements
      });
      jobIds.push(job._id);
    }
    await Employer.updateOne({ _id: employer._id }, { $set: { jobs: jobIds } });

    // 4. Seed Student
    console.log('Seeding Student...');
    const studentUser = await User.findOne({ email: 'student@lms.com' });
    let stdUserId = studentUser ? studentUser._id : null;

    if (!stdUserId) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Student@123', salt);
      const newStd = await User.create({
        name: 'Alex Dev',
        email: 'student@lms.com',
        password: hashedPassword,
        role: 'student'
      });
      stdUserId = newStd._id;
    }

    let student = await Student.findOne({ user: stdUserId });
    if (!student) {
      await Student.create({
        user: stdUserId,
        skillTags: ['JavaScript', 'React', 'Next.js']
      });
    }

    console.log('\n--- LMS Seeding Complete! ---');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
}

seed();
