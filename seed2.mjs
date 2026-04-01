import mongoose from 'mongoose';
import connectDB from './modules/lms/lib/db.js';
import Course from './modules/lms/models/Course.js';
import Job from './modules/lms/models/Job.js';
import Internship from './modules/lms/models/Internship.js';

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

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected!');

    console.log('Clearing existing data...');
    await Course.deleteMany({});
    await Job.deleteMany({});
    await Internship.deleteMany({});

    console.log('Inserting sample courses...');
    await Course.insertMany(sampleCourses);

    console.log('Inserting sample jobs...');
    await Job.insertMany(sampleJobs);

    console.log('Inserting sample internships...');
    await Internship.insertMany(sampleInternships);

    console.log('Database seeded successfully!');
    mongoose.connection.close(); // Crucial to exit the process
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

seed();
