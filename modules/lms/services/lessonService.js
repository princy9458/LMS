import Course from '@/modules/lms/models/Course';
import Lesson from '@/modules/lms/models/Lesson';

export const lessonService = {
  async createLesson(data) {
    const lesson = await Lesson.create(data);

    if (lesson.course) {
      await Course.findByIdAndUpdate(
        lesson.course,
        { $addToSet: { lessons: lesson._id }, $inc: { totalLessons: 1 } },
        { new: true }
      );
    }

    return lesson;
  },

  async listLessons(filter = {}) {
    return Lesson.find(filter).sort({ order: 1, createdAt: -1 });
  },

  async listLessonsByCourse(courseId) {
    return Lesson.find({ course: courseId }).sort({ order: 1 });
  },

  async getLessonById(id) {
    return Lesson.findById(id);
  },

  async updateLesson(id, payload) {
    return Lesson.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    });
  },

  async deleteLesson(id) {
    return Lesson.findByIdAndDelete(id);
  }
};
