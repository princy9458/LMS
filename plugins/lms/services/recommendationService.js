import mongoose from 'mongoose';

export const getRecommendations = async (studentId) => {
  const Course = mongoose.models.Course;
  const Enrollment = mongoose.models.Enrollment;

  // 1. Get student's current enrollments to avoid recommending what they already have
  const currentEnrollments = await Enrollment.find({ student: studentId }).select('course');
  const enrolledCourseIds = currentEnrollments.map(e => e.course.toString());

  // 2. Find their most active categories
  const activeEnrollments = await Enrollment.find({ student: studentId }).populate('course');
  const categories = activeEnrollments.map(e => e.course.category);
  const topCategory = categories.sort((a,b) =>
    categories.filter(v => v===a).length - categories.filter(v => v===b).length
  ).pop();

  // 3. Logic: Find courses in their top category (or high rated) that they aren't enrolled in
  let recommendations = await Course.find({
    _id: { $nin: enrolledCourseIds },
    $or: [
      { category: topCategory },
      { level: 'Beginner' } // Fallback for diversity
    ]
  }).limit(5);

  // If still low on recommendations, just get the latest courses
  if (recommendations.length < 3) {
    const latest = await Course.find({ _id: { $nin: enrolledCourseIds } }).limit(5);
    recommendations = [...new Set([...recommendations, ...latest])].slice(0, 5);
  }

  return recommendations;
};

export const recommendationService = {
  getRecommendations
};
