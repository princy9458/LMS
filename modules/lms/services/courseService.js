import Course from '@/modules/lms/models/Course';
import { getCourseTreeById } from '@/modules/lms/utils/learningTree';

export const courseService = {
  async createCourse(data) {
    return Course.create(data);
  },

  async listCourses() {
    return Course.find({}).sort({ createdAt: -1 });
  },

  async getCourseById(id) {
    return getCourseTreeById(id);
  },

  async updateCourse(id, payload) {
    const course = await Course.findById(id);
    if (!course) return null;
    course.set(payload);
    await course.save();
    return course;
  },

  async deleteCourse(id) {
    return Course.findByIdAndDelete(id);
  }
};
