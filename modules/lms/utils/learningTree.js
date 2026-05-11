import Course from '@/modules/lms/models/Course';
import Lesson from '@/modules/lms/models/Lesson';
import Topic from '@/modules/lms/models/Topic';
import Quiz from '@/modules/lms/models/Quiz';
import Question from '@/modules/lms/models/Question';
import Answer from '@/modules/lms/models/Answer';
import { localizeCourseDocument, localizeLessonDocument, localizeQuestionDocument, localizeQuizDocument } from '@/modules/lms/utils/courseLocalization';
import { resolveDocumentBySlugOrId } from '@/modules/lms/utils/slug';

const REGISTERED_TREE_MODELS = [Question, Answer];
void REGISTERED_TREE_MODELS;

const QUESTION_POPULATE = {
  path: 'questions',
  options: { sort: { order: 1, createdAt: 1 } },
  populate: {
    path: 'answers',
    options: { sort: { order: 1, createdAt: 1 } },
  },
};

const QUIZ_POPULATE = {
  path: 'quizzes',
  options: { sort: { order: 1, createdAt: 1 } },
  populate: QUESTION_POPULATE,
};

const TOPIC_RELATIONS_POPULATE = [
  { path: 'quizId', populate: QUESTION_POPULATE },
  QUIZ_POPULATE,
];

function toPlain(doc) {
  if (!doc) {
    return doc;
  }

  return typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : { ...doc };
}

function normalizeQuestionTree(question, locale) {
  const localized = localizeQuestionDocument(question, locale);
  const plain = toPlain(question);

  return {
    ...plain,
    ...localized,
    answers: Array.isArray(plain?.answers)
      ? plain.answers.map((answer) => toPlain(answer))
      : localized.answers,
  };
}

function normalizeQuizTree(quiz, locale) {
  const localized = localizeQuizDocument(quiz, locale);
  const plain = toPlain(quiz);

  return {
    ...plain,
    ...localized,
    questions: Array.isArray(plain?.questions)
      ? plain.questions.map((question) => normalizeQuestionTree(question, locale))
      : localized.questions,
  };
}

function normalizeTopicTree(topic, locale) {
  const plain = toPlain(topic);
  const resolvedQuiz = plain?.quizId || (Array.isArray(plain?.quizzes) ? plain.quizzes[0] : null);

  return {
    ...plain,
    description: plain?.description || '',
    videoUrl: plain?.videoUrl || '',
    duration: plain?.duration || 0,
    keyPoints: Array.isArray(plain?.keyPoints) ? plain.keyPoints : [],
    notes: Array.isArray(plain?.notes) ? plain.notes : [],
    resources: Array.isArray(plain?.resources) ? plain.resources : [],
    codeExample: plain?.codeExample || '',
    summary: plain?.summary || '',
    quizId: resolvedQuiz ? normalizeQuizTree(resolvedQuiz, locale) : null,
    content: plain?.content ?? '',
    contentHtml: plain?.contentHtml || plain?.content || '',
    quizzes: Array.isArray(plain?.quizzes)
      ? plain.quizzes.map((quiz) => normalizeQuizTree(quiz, locale))
      : resolvedQuiz
        ? [normalizeQuizTree(resolvedQuiz, locale)]
        : [],
  };
}

async function attachTopicsToLessons(lessons) {
  const lessonIds = lessons.map((lesson) => lesson?._id).filter(Boolean);
  if (!lessonIds.length) {
    return lessons;
  }

  let topics = [];
  try {
    topics = await Topic.find({ lesson: { $in: lessonIds } })
      .sort({ order: 1, createdAt: 1 })
      .populate(TOPIC_RELATIONS_POPULATE);
  } catch (error) {
    console.error('Failed to attach topics to lessons:', error);
  }

  const topicMap = topics.reduce((acc, topic) => {
    const lessonKey = String(topic.lesson);
    if (!acc[lessonKey]) acc[lessonKey] = [];
    acc[lessonKey].push(topic);
    return acc;
  }, {});

  return lessons.map((lesson) => ({
    ...toPlain(lesson),
    topics: topicMap[String(lesson._id)] || [],
  }));
}

export function normalizeLessonTree(lesson, locale) {
  if (!lesson) {
    return lesson;
  }

  const localized = localizeLessonDocument(lesson, locale);
  const plain = toPlain(lesson);

  return {
    ...plain,
    ...localized,
    courseId: localized.courseId || localized.course,
    topics: Array.isArray(plain?.topics)
      ? plain.topics.map((topic) => normalizeTopicTree(topic, locale))
      : [],
    quizzes: Array.isArray(plain?.quizzes)
      ? plain.quizzes.map((quiz) => normalizeQuizTree(quiz, locale))
      : [],
  };
}

export function normalizeCourseTree(course, locale) {
  if (!course) {
    return course;
  }

  const localized = localizeCourseDocument(course, locale);
  const plain = toPlain(course);

  return {
    ...plain,
    ...localized,
    lessons: Array.isArray(plain?.lessons)
      ? plain.lessons.map((lesson) => normalizeLessonTree(lesson, locale))
      : [],
  };
}

export async function getLessonTreeById(lessonId) {
  const lesson = await resolveDocumentBySlugOrId(Lesson, lessonId);
  if (!lesson) return lesson;
  let topics = [];
  try {
    topics = await Topic.find({ lesson: lesson._id })
      .sort({ order: 1, createdAt: 1 })
      .populate(TOPIC_RELATIONS_POPULATE);
  } catch (error) {
    console.error('Failed to load lesson topics:', error);
  }
  return {
    ...toPlain(lesson),
    topics,
  };
}

export async function getLessonTreeByCourse(courseId) {
  const lessons = await Lesson.find({ course: courseId })
    .sort({ order: 1, createdAt: 1 })
    .lean(false);
  return attachTopicsToLessons(lessons);
}

export async function getCourseTreeById(courseId) {
  let course = null;
  try {
    course = await resolveDocumentBySlugOrId(Course, courseId, {
      populate: {
        path: 'lessons',
        options: { sort: { order: 1, createdAt: 1 } },
      },
    });
    if (!course) {
      return course;
    }
  } catch (error) {
    console.error('Failed to load populated course tree:', error);
    course = await resolveDocumentBySlugOrId(Course, courseId);
  }

  if (!course) {
    return course;
  }

  let lessonList = Array.isArray(course.lessons) ? course.lessons : [];
  if (!lessonList.length) {
    try {
      lessonList = await Lesson.find({ course: course._id })
        .sort({ order: 1, createdAt: 1 })
        .lean(false);
    } catch (error) {
      console.error('Failed to load fallback course lessons:', error);
    }
  }

  const lessonsWithTopics = await attachTopicsToLessons(lessonList);
  return {
    ...toPlain(course),
    lessons: lessonsWithTopics,
  };
}

export async function getTopicTreeById(topicId) {
  return resolveDocumentBySlugOrId(Topic, topicId, { populate: TOPIC_RELATIONS_POPULATE });
}

export async function getTopicTreeByLesson(lessonId) {
  try {
    return await Topic.find({ lesson: lessonId })
      .sort({ order: 1, createdAt: 1 })
      .populate(TOPIC_RELATIONS_POPULATE);
  } catch (error) {
    console.error('Failed to load topic tree by lesson:', error);
    return Topic.find({ lesson: lessonId })
      .sort({ order: 1, createdAt: 1 });
  }
}

export async function getQuizTreeById(quizId) {
  return resolveDocumentBySlugOrId(Quiz, quizId, { populate: QUESTION_POPULATE });
}

export { QUESTION_POPULATE, QUIZ_POPULATE, TOPIC_RELATIONS_POPULATE };
