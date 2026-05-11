import Course from '@/modules/lms/models/Course';
import Lesson from '@/modules/lms/models/Lesson';
import { getLessonTreeByCourse, getLessonTreeById } from '@/modules/lms/utils/learningTree';

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
    return Lesson.find(filter)
      .sort({ order: 1, createdAt: 1 });
  },

  async listLessonsByCourse(courseId) {
    return getLessonTreeByCourse(courseId);
  },

  async getLessonById(id) {
    return getLessonTreeById(id);
  },

  async updateLesson(id, payload) {
    const lesson = await Lesson.findById(id);
    if (!lesson) return null;

    const oldCourseId = lesson.course?.toString();
    const newCourseId = payload.course?.toString();

    lesson.set(payload);
    await lesson.save();

    if (newCourseId && oldCourseId !== newCourseId) {
      if (oldCourseId) {
        await Course.findByIdAndUpdate(oldCourseId, {
          $pull: { lessons: id },
          $inc: { totalLessons: -1 }
        });
      }
      await Course.findByIdAndUpdate(newCourseId, {
        $addToSet: { lessons: id },
        $inc: { totalLessons: 1 }
      });
    }

    return lesson;
  },

  async deleteLesson(id) {
    const lesson = await Lesson.findById(id);
    if (lesson && lesson.course) {
      await Course.findByIdAndUpdate(lesson.course, {
        $pull: { lessons: id },
        $inc: { totalLessons: -1 }
      });
    }
    return Lesson.findByIdAndDelete(id);
  }
};
