import Course from '@/modules/lms/models/Course';

export const courseService = {
  async createCourse(data) {
    return Course.create(data);
  },

  async listCourses() {
    return Course.find({}).sort({ createdAt: -1 });
  },

  async getCourseById(id) {
    return Course.findById(id);
  },

  async updateCourse(id, payload) {
    return Course.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    });
  },

  async deleteCourse(id) {
    return Course.findByIdAndDelete(id);
  }
};
