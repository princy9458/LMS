import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import Topic from '../models/Topic';
import Quiz from '../models/Quiz';

export const progressService = {
  /**
   * Universal progress updater for Lessons, Topics, and Quizzes
   */
  async trackProgress(userId, courseId, itemId, itemType, status = 'completed') {
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) throw new Error('Enrollment not found');

    const fieldMap = {
      lesson: 'completedLessons',
      topic: 'completedTopics',
      quiz: 'completedQuizzes'
    };

    const targetField = fieldMap[itemType];
    const isAlreadyCompleted = enrollment[targetField].includes(itemId);

    if (status === 'completed' && !isAlreadyCompleted) {
      enrollment[targetField].push(itemId);
    } else if (status === 'incomplete' && isAlreadyCompleted) {
      enrollment[targetField] = enrollment[targetField].filter(id => id.toString() !== itemId);
    }

    // Update current position if it's a lesson
    if (itemType === 'lesson') enrollment.currentLesson = itemId;

    // Recalculate dynamic percentage
    const stats = await this.calculateCourseStats(courseId);
    const completedCount = 
      enrollment.completedLessons.length + 
      enrollment.completedTopics.length + 
      enrollment.completedQuizzes.length;
    
    const totalCount = stats.totalLessons + stats.totalTopics + stats.totalQuizzes;

    enrollment.progressPercent = totalCount > 0 
      ? Math.round((completedCount / totalCount) * 100) 
      : 0;

    if (enrollment.progressPercent >= 100) {
      enrollment.isCompleted = true;
      if (!enrollment.completedAt) enrollment.completedAt = new Date();
    }

    await enrollment.save();
    return enrollment;
  },

  /**
   * Helper to count total weight of a course
   */
  async calculateCourseStats(courseId) {
    const [totalLessons, totalTopics, totalQuizzes] = await Promise.all([
      Lesson.countDocuments({ course: courseId }),
      Lesson.find({ course: courseId }).then(async (lessons) => {
          const lessonIds = lessons.map(l => l._id);
          return await Topic.countDocuments({ lesson: { $in: lessonIds } });
      }),
      Quiz.countDocuments({ course: courseId })
    ]);

    return { totalLessons, totalTopics, totalQuizzes };
  },

  /**
   * Get next lesson in sequence
   */
  async getNextLesson(courseId, currentLessonId) {
    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });
    const currentIndex = lessons.findIndex(l => l._id.toString() === currentLessonId);
    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
      return lessons[currentIndex + 1];
    }
    return null;
  }
};
