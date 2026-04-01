import Enrollment from '../models/Enrollment';
import Course from '../models/Course';

export const enrollmentService = {
  /**
   * Enroll a student in a course
   */
  async enrollStudent(userId, courseId) {
    const existing = await Enrollment.findOne({ user: userId, course: courseId });
    if (existing) return existing;

    return await Enrollment.create({
      user: userId,
      course: courseId,
      progressPercent: 0,
      isCompleted: false
    });
  },

  /**
   * Update student progress
   */
  async updateProgress(userId, courseId, lessonId) {
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) throw new Error('Enrollment not found');

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      
      // Calculate new percentage
      const course = await Course.findById(courseId).populate({
        path: 'modules',
        populate: { path: 'lessons' }
      });
      
      let totalLessons = 0;
      course.modules.forEach(m => totalLessons += m.lessons.length);
      
      enrollment.progressPercent = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
      
      if (enrollment.progressPercent >= 100) {
        enrollment.isCompleted = true;
        enrollment.completedAt = new Date();
      }
      
      await enrollment.save();
    }
    
    return enrollment;
  },

  /**
   * Get student's active enrollments
   */
  async getStudentEnrollments(userId) {
    return await Enrollment.find({ user: userId })
      .populate('course', 'title thumbnail category');
  },

  /**
   * Get specific enrollment with progress
   */
  async getEnrollment(userId, courseId) {
    return await Enrollment.findOne({ user: userId, course: courseId })
      .populate('course')
      .populate('currentLesson');
  }
};
