import Lesson from '../models/Lesson';
import Module from '../models/Module';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';

export const lessonService = {
  /**
   * Get full lesson details with enrollment check
   */
  async getLessonDetails(userId, lessonId) {
    const lesson = await Lesson.findById(lessonId)
      .populate('quizzes')
      .populate('topics');
    
    if (!lesson) throw new Error('Lesson not found');

    // Check enrollment
    const enrollment = await Enrollment.findOne({ 
      user: userId, 
      tenant: lesson.tenant 
    }).populate({
      path: 'course',
      match: { modules: lesson.module }
    });

    // Simple security: find if this lesson belongs to a module in an enrolled course
    // In a production app, we'd use a more direct link or cached mapping
    const courseWithLesson = await Course.findOne({ modules: lesson.module });
    const isEnrolled = await Enrollment.exists({ user: userId, course: courseWithLesson?._id });

    if (!isEnrolled && !lesson.isPreview) {
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

    return course.modules;
  }
};
