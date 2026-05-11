import Lesson from '../models/Lesson';
import Module from '../models/Module';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import { normalizeLessonTree } from '@/modules/lms/utils/learningTree';

export const lessonService = {
  /**
   * Get full lesson details with enrollment check
   */
  async getLessonDetails(userId, lessonId) {
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) throw new Error('Lesson not found');

    const isEnrolled = await Enrollment.exists({ user: userId, course: lesson.course });

    // Lessons are lightweight now; only unlock rules determine preview access.
    if (!isEnrolled && lesson.unlockType !== 'none') {
      throw new Error('You must be enrolled to view this lesson');
    }

    return lesson;
  },

  /**
   * Get course syllabus for sidebar
   */
  async getCourseSyllabus(courseId) {
    const course = await Course.findById(courseId).populate({
      path: 'modules',
      options: { sort: { order: 1 } },
      populate: {
        path: 'lessons',
        options: { sort: { order: 1 } }
      }
    });

    if (!course) throw new Error('Course not found');

    const courseLessons = await Lesson.find({ course: courseId })
      .sort({ order: 1, createdAt: 1 })
      ;

    return [
      {
        ...course.toObject({ virtuals: true }),
        lessons: courseLessons.map((lesson) => normalizeLessonTree(lesson, 'en')),
      },
    ];
  }
};
