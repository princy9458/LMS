import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import Course from '@/modules/lms/models/Course';
import Lesson from '@/modules/lms/models/Lesson';
import Topic from '@/modules/lms/models/Topic';
import Quiz from '@/modules/lms/models/Quiz';
import Question from '@/modules/lms/models/Question';
import Job from '@/modules/lms/models/Job';
import Internship from '@/modules/lms/models/Internship';

const toSlug = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function GET() {
  try {
    await dbConnect();
    
    // Clear existing
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Topic.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await Job.deleteMany({});
    await Internship.deleteMany({});

    // Sample data
    const sampleCourses = [
      {
        title: 'Advanced React Native',
        description: 'Learn to build cross-platform mobile apps with React Native and Expo.',
        slug: toSlug('Advanced React Native'),
        category: 'Software Engineering',
        instructorName: 'Admin',
        instructorId: new mongoose.Types.ObjectId(),
        totalLessons: 12,
        skillsEarned: ['React Native', 'Mobile Development', 'JavaScript'],
      },
      {
        title: 'Fullstack Next.js Development',
        description: 'Master server-side rendering, API routes, and database integration with Next.js.',
        slug: toSlug('Fullstack Next.js Development'),
        category: 'Software Engineering',
        instructorName: 'Admin',
        instructorId: new mongoose.Types.ObjectId(),
        totalLessons: 15,
        skillsEarned: ['Next.js', 'React', 'MongoDB'],
      },
      {
        title: 'UI/UX Design Fundamentals',
        description: 'Learn the principles of user interface and user experience design.',
        slug: toSlug('UI/UX Design Fundamentals'),
        category: 'UI/UX Design',
        instructorName: 'Admin',
        instructorId: new mongoose.Types.ObjectId(),
        totalLessons: 8,
        skillsEarned: ['Figma', 'UI Design', 'UX Research'],
      }
    ];

    const aiCourse = await Course.create({
      title: { en: 'AI & Machine Learning' },
      description: { en: 'Learn the core ideas behind artificial intelligence, machine learning, and practical model thinking.' },
      slug: 'ai-machine-learning',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80',
      category: 'Software Engineering',
      instructorName: 'Admin',
      price: 0,
      currency: 'USD',
      isPaid: false,
      accessType: 'free',
      level: 'Beginner',
      difficultyLevel: 'Beginner',
      isPublished: true,
      totalLessons: 1,
      skillsEarned: ['Artificial Intelligence', 'Machine Learning', 'Prompting']
    });

    const introLesson = await Lesson.create({
      title: { en: 'Introduction to AI' },
      slug: toSlug('Introduction to AI'),
      course: aiCourse._id,
      order: 1,
      unlockType: 'none',
      unlockAfterDays: 0,
    });

    const aiIllustration = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 650">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#2563eb"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="650" rx="36" fill="url(#g)"/>
        <circle cx="335" cy="325" r="150" fill="rgba(255,255,255,0.1)"/>
        <circle cx="670" cy="220" r="72" fill="rgba(255,255,255,0.18)"/>
        <circle cx="760" cy="355" r="104" fill="rgba(255,255,255,0.14)"/>
        <rect x="825" y="170" width="210" height="28" rx="14" fill="rgba(255,255,255,0.24)"/>
        <rect x="825" y="215" width="160" height="22" rx="11" fill="rgba(255,255,255,0.16)"/>
        <text x="90" y="560" fill="white" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="700">AI learning journey</text>
      </svg>
    `)}`;

    const topics = await Topic.insertMany([
      {
        title: 'What is AI?',
        slug: toSlug('What is AI?'),
        description: 'A practical introduction to artificial intelligence and the types of systems it powers.',
        videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
        duration: 8,
        keyPoints: [
          'AI systems detect patterns in data',
          'Machine learning is a subset of AI',
          'Most production AI is narrow and task-specific'
        ],
        notes: 'Use the summary to reinforce the main ideas after watching the video.',
        resources: [
          { title: 'AI overview from IBM', url: 'https://www.ibm.com/topics/artificial-intelligence' }
        ],
        codeExample: `const model = train(dataset);
const result = model.predict(input);`,
        summary: 'AI combines data, logic, and feedback loops to automate tasks that previously required human judgment.',
        quizId: null,
        content: 'Artificial intelligence is software that performs tasks associated with human intelligence.',
        contentHtml: `
          <h2>What is AI?</h2>
          <p>Artificial Intelligence is the field of building systems that can perceive, reason, learn, and act in ways that feel intelligent to people.</p>
          <figure style="margin:1.5rem 0;">
            <img src="${aiIllustration}" alt="AI learning illustration" style="width:100%;border-radius:1.25rem;display:block;" />
          </figure>
          <div style="margin:1.5rem 0;border-radius:1.25rem;overflow:hidden;border:1px solid #dbeafe;background:#0f172a;">
            <iframe
              src="https://www.youtube.com/embed/JMUxmLyrhSk"
              title="Introduction to AI"
              style="width:100%;min-height:320px;border:0;"
              allowFullScreen
            ></iframe>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.25rem 0;">
            <div style="border:1px solid #e2e8f0;border-radius:1rem;padding:1rem;background:#f8fafc;">
              <p style="margin:0 0 .35rem;font-weight:800;color:#0f172a;">Perceive</p>
              <p style="margin:0;color:#475569;">Computer vision, speech, and sensor inputs.</p>
            </div>
            <div style="border:1px solid #e2e8f0;border-radius:1rem;padding:1rem;background:#f8fafc;">
              <p style="margin:0 0 .35rem;font-weight:800;color:#0f172a;">Reason</p>
              <p style="margin:0;color:#475569;">Prediction, classification, and decision support.</p>
            </div>
          </div>
          <aside style="margin:1.25rem 0;border-left:4px solid #2563eb;background:#eff6ff;padding:1rem 1.1rem;border-radius:1rem;">
            <p style="margin:0 0 .35rem;font-weight:800;color:#1d4ed8;">Takeaway</p>
            <p style="margin:0;color:#1e293b;">AI is not magic. It is pattern recognition plus data, logic, and feedback loops.</p>
          </aside>
          <h3>Core traits</h3>
          <ul>
            <li>Works on structured or unstructured data</li>
            <li>Improves with training and feedback</li>
            <li>Can automate repetitive decisions</li>
          </ul>
          <pre style="margin:1.25rem 0;overflow:auto;border-radius:1rem;background:#0f172a;color:#e2e8f0;padding:1rem 1.1rem;"><code>const model = train(dataset);
const result = model.predict(input);</code></pre>
        `,
        course: aiCourse._id,
        lesson: introLesson._id,
        order: 1
      },
      {
        title: 'Types of AI',
        slug: toSlug('Types of AI'),
        content: 'Narrow AI focuses on one task, while general AI would reason across many tasks.',
        contentHtml: `
          <h2>Types of AI</h2>
          <p>Most production AI today is <strong>narrow AI</strong>, meaning it is trained to solve one class of problems very well.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.25rem 0;">
            <div style="border-radius:1.1rem;padding:1rem;background:#0f172a;color:#fff;">
              <p style="margin:0 0 .35rem;font-weight:800;">Narrow AI</p>
              <p style="margin:0;color:rgba(255,255,255,.8);">Examples: recommendations, chatbots, fraud detection.</p>
            </div>
            <div style="border-radius:1.1rem;padding:1rem;background:#dbeafe;color:#1e3a8a;">
              <p style="margin:0 0 .35rem;font-weight:800;">General AI</p>
              <p style="margin:0;">A future concept of AI that can reason across many domains.</p>
            </div>
          </div>
          <div style="margin:1.25rem 0;border:1px solid #e2e8f0;border-radius:1rem;padding:1rem;background:#ffffff;box-shadow:0 10px 35px rgba(15,23,42,0.04);">
            <p style="margin:0 0 .5rem;font-weight:800;">Comparison</p>
            <ul style="margin:0;padding-left:1.2rem;">
              <li>Narrow AI: focused, task-specific, widely deployed</li>
              <li>General AI: broad reasoning, still theoretical</li>
            </ul>
          </div>
          <blockquote style="margin:1.25rem 0;padding:1rem 1.15rem;border-left:4px solid #f59e0b;background:#fffbeb;border-radius:1rem;">
            Machine learning is one of the most practical ways to build narrow AI.
          </blockquote>
        `,
        course: aiCourse._id,
        lesson: introLesson._id,
        order: 2
      },
      {
        title: 'Machine Learning Intro',
        slug: toSlug('Machine Learning Intro'),
        content: 'Machine learning helps systems improve predictions by learning patterns from data.',
        contentHtml: `
          <h2>Machine Learning Intro</h2>
          <p>Machine learning is a subset of AI where a system learns from examples instead of being programmed with every rule by hand.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin:1.25rem 0;">
            <div style="border-radius:1rem;background:#eff6ff;border:1px solid #bfdbfe;padding:1rem;">
              <strong>Supervised learning</strong>
              <p style="margin:.5rem 0 0;color:#334155;">Use labeled examples to predict outputs.</p>
            </div>
            <div style="border-radius:1rem;background:#f0fdf4;border:1px solid #bbf7d0;padding:1rem;">
              <strong>Unsupervised learning</strong>
              <p style="margin:.5rem 0 0;color:#334155;">Discover groups and structure without labels.</p>
            </div>
          </div>
          <pre style="margin:1.25rem 0;overflow:auto;border-radius:1rem;background:#0f172a;color:#e2e8f0;padding:1rem 1.1rem;"><code>from sklearn.linear_model import LinearRegression
model = LinearRegression().fit(X_train, y_train)</code></pre>
          <aside style="margin:1.25rem 0;border-left:4px solid #2563eb;background:#eff6ff;padding:1rem 1.1rem;border-radius:1rem;">
            <p style="margin:0 0 .35rem;font-weight:800;color:#1d4ed8;">Why it matters</p>
            <p style="margin:0;color:#1e293b;">This is the bridge between AI theory and production systems that learn from data.</p>
          </aside>
        `,
        course: aiCourse._id,
        lesson: introLesson._id,
        order: 3
      },
      {
        title: 'Real World AI Applications',
        slug: toSlug('Real World AI Applications'),
        content: 'AI powers assistants, recommendations, search ranking, and decision support across many industries.',
        contentHtml: `
          <h2>Real World AI Applications</h2>
          <p>AI shows up anywhere there is enough data to detect patterns, predict outcomes, or automate repetitive decisions.</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1rem;margin:1.25rem 0;">
            <div style="border-radius:1rem;background:#f8fafc;border:1px solid #e2e8f0;padding:1rem;">
              <strong>Healthcare</strong>
              <p style="margin:.5rem 0 0;color:#475569;">Assistive diagnostics and triage support.</p>
            </div>
            <div style="border-radius:1rem;background:#f8fafc;border:1px solid #e2e8f0;padding:1rem;">
              <strong>Finance</strong>
              <p style="margin:.5rem 0 0;color:#475569;">Fraud detection and risk scoring.</p>
            </div>
            <div style="border-radius:1rem;background:#f8fafc;border:1px solid #e2e8f0;padding:1rem;">
              <strong>Retail</strong>
              <p style="margin:.5rem 0 0;color:#475569;">Recommendations and demand forecasting.</p>
            </div>
          </div>
          <div style="margin:1.25rem 0;border-radius:1rem;padding:1rem 1.1rem;background:#0f172a;color:#e2e8f0;">
            <p style="margin:0 0 .5rem;font-weight:800;">Example workflow</p>
            <pre style="margin:0;white-space:pre-wrap;background:transparent;color:inherit;padding:0;"><code>Input data -> model prediction -> human review -> improved outcome</code></pre>
          </div>
          <aside style="margin:1.25rem 0;border-left:4px solid #22c55e;background:#f0fdf4;padding:1rem 1.1rem;border-radius:1rem;">
            <p style="margin:0 0 .35rem;font-weight:800;color:#15803d;">Why it matters</p>
            <p style="margin:0;color:#1e293b;">The best AI demos are not abstract. They solve visible business problems.</p>
          </aside>
        `,
        course: aiCourse._id,
        lesson: introLesson._id,
        order: 4
      }
    ]);

    const aiQuiz = await Quiz.create({
      title: { en: 'Basic AI Quiz' },
      slug: toSlug('Basic AI Quiz'),
      description: { en: 'A short quiz to check your understanding of the lesson.' },
      course: aiCourse._id,
      lesson: introLesson._id,
      topic: topics[0]._id,
      passingScore: 70,
      passingMarks: 70,
      timeLimit: 10,
      totalPoints: 3,
      order: 1
    });

    const demoQuestions = await Question.insertMany([
      {
        quiz: aiQuiz._id,
        text: { en: 'What does AI stand for?' },
        type: 'single',
        points: 1,
        options: ['Artificial Intelligence', 'Automated Input', 'Advanced Internet', 'Adaptive Interface'],
        correctAnswerIndex: 0,
        order: 1
      },
      {
        quiz: aiQuiz._id,
        text: { en: 'Which of these is an example of AI?' },
        type: 'single',
        points: 1,
        options: ['Calculator', 'Voice assistant', 'Notebook', 'Clock'],
        correctAnswerIndex: 1,
        order: 2
      },
      {
        quiz: aiQuiz._id,
        text: { en: 'Narrow AI means' },
        type: 'single',
        points: 1,
        options: ['AI that can do one specific task', 'AI that is conscious', 'AI that can do everything', 'AI that only writes code'],
        correctAnswerIndex: 0,
        order: 3
      }
    ]);

    await Quiz.findByIdAndUpdate(aiQuiz._id, {
      questions: demoQuestions.map((question) => question._id)
    });

    await Lesson.findByIdAndUpdate(introLesson._id, {
      topics: topics.map((topic) => topic._id),
      quizzes: [aiQuiz._id]
    });

    await Topic.findByIdAndUpdate(topics[0]._id, {
      quizzes: [aiQuiz._id]
    });

    await Course.findByIdAndUpdate(aiCourse._id, {
      lessons: [introLesson._id],
      totalLessons: 1
    });

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

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        courseId: aiCourse._id,
        lessonId: introLesson._id,
        topicIds: topics.map((topic) => topic._id),
        quizId: aiQuiz._id
      }
    });
  } catch (error) {
    console.error('Error seeding:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
