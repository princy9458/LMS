import Course from '../models/Course';
import Module from '../models/Module';
import Lesson from '../models/Lesson';

export const courseService = {
  /**
   * Fetch all published courses
   */
  async getAllCourses() {
    return await Course.find({ isPublished: true })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });
  },

  /**
   * Fetch full course syllabus
   */
  async getCourseById(id) {
    return await Course.findById(id)
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons',
          select: 'title order unlockType unlockAfterDays course'
        }
      })
      .populate('instructor', 'name email');
  },

  /**
   * Create a new course with modules
   */
  async createCourse(courseData, instructorId) {
    const { modules, ...rest } = courseData;
    const course = await Course.create({ ...rest, instructor: instructorId });
    
    if (modules && modules.length > 0) {
      const createdModules = await Promise.all(
        modules.map(async (m, index) => {
          const mod = await Module.create({ ...m, course: course._id, order: index });
          return mod._id;
        })
      );
      course.modules = createdModules;
      await course.save();
    }
    
    return course;
  }
};
