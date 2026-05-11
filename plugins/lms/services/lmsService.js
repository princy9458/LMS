import mongoose from 'mongoose';
import Lesson from '../models/Lesson';
import Topic from '../models/Topic';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import Answer from '../models/Answer';
import Course from '../models/Course';

export const lmsService = {
  // Course CRUD
  async createCourse(tenantId, data) {
    return await Course.create({ ...data, tenant: tenantId });
  },
  async updateCourse(id, data) {
    const course = await Course.findById(id);
    if (!course) return null;
    course.set(data);
    await course.save();
    return course;
  },
  async deleteCourse(id) {
    // In a real app, handle cascading deletes or archiving
    return await Course.findByIdAndDelete(id);
  },

  // Lesson CRUD
  async createLesson(tenantId, data) {
    return await Lesson.create({ ...data, tenant: tenantId });
  },
  async updateLesson(id, data) {
    const lesson = await Lesson.findById(id);
    if (!lesson) return null;
    lesson.set(data);
    await lesson.save();
    return lesson;
  },
  async deleteLesson(id) {
    return await Lesson.findByIdAndDelete(id);
  },
  async getLessonsByCourse(courseId) {
    return await Lesson.find({ course: courseId }).sort({ order: 1 });
  },

  // Topic CRUD
  async createTopic(tenantId, data) {
    return await Topic.create({ ...data, tenant: tenantId });
  },
  async updateTopic(id, data) {
    const topic = await Topic.findById(id);
    if (!topic) return null;
    topic.set(data);
    await topic.save();
    return topic;
  },
  async deleteTopic(id) {
    return await Topic.findByIdAndDelete(id);
  },
  async getTopicsByLesson(lessonId) {
    return await Topic.find({ lesson: lessonId }).sort({ order: 1 });
  },

  // Quiz CRUD
  async createQuiz(tenantId, data) {
    return await Quiz.create({ ...data, tenant: tenantId });
  },
  async updateQuiz(id, data) {
    const quiz = await Quiz.findById(id);
    if (!quiz) return null;
    quiz.set(data);
    await quiz.save();
    return quiz;
  },
  async deleteQuiz(id) {
    return await Quiz.findByIdAndDelete(id);
  },
  async getQuizzes(filter) {
    return await Quiz.find(filter).sort({ order: 1 });
  },

  // Question CRUD
  async createQuestion(tenantId, data) {
    return await Question.create({ ...data, tenant: tenantId });
  },
  async updateQuestion(id, data) {
    return await Question.findByIdAndUpdate(id, data, { new: true });
  },
  async deleteQuestion(id) {
    return await Question.findByIdAndDelete(id);
  },
  async getQuestionsByQuiz(quizId) {
    return await Question.find({ quiz: quizId }).sort({ order: 1 });
  },

  // Bulk Actions
  async bulkDelete(type, ids) {
    const Model = mongoose.model(type.charAt(0).toUpperCase() + type.slice(1));
    return await Model.deleteMany({ _id: { $in: ids } });
  },

  async bulkMove(type, ids, parentId) {
    const Model = mongoose.model(type.charAt(0).toUpperCase() + type.slice(1));
    const updateField = type === 'lesson' ? 'course' : 'lesson';
    return await Model.updateMany({ _id: { $in: ids } }, { [updateField]: parentId });
  }
};
