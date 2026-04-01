import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import Student from '../models/Student';

export const analyticsService = {
  /**
   * Get platform stats for Admin
   */
  async getAdminStats() {
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalStudents = await Student.countDocuments();
    
    // Calculate avg progress
    const enrollments = await Enrollment.find({}, 'progressPercent');
    const avgProgress = enrollments.length > 0 
      ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progressPercent, 0) / enrollments.length)
      : 0;

    return {
      totalCourses,
      totalEnrollments,
      totalStudents,
      avgProgress
    };
  },

  /**
   * Get deep dive analytics for a specific student
   */
  async getStudentAnalytics(studentId) {
    const enrollments = await Enrollment.find({ student: studentId }).populate('course');
    
    const totalEnrolled = enrollments.length;
    const completedCount = enrollments.filter(e => e.status === 'completed').length;
    const totalLessonsDone = enrollments.reduce((acc, e) => acc + (e.completedLessons?.length || 0), 0);
    const avgProgress = totalEnrolled > 0 
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progressPercent, 0) / totalEnrolled)
      : 0;

    // Engagement heuristics
    const learningTimeHours = Math.round(totalLessonsDone * 0.45); 
    const engagementScore = Math.min(100, (totalLessonsDone * 4) + (completedCount * 12));

    return {
      overview: {
        totalEnrolled,
        completedCount,
        avgProgress,
        learningTimeHours,
        engagementScore
      },
      courseBreakdown: enrollments.map(e => ({
        id: e.course._id,
        title: e.course.title,
        progress: e.progressPercent,
        lessonsDone: e.completedLessons?.length || 0,
        status: e.status
      }))
    };
  }
};
