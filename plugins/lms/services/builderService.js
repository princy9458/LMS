import Course from '../models/Course';
import Lesson from '../models/Lesson';
import Topic from '../models/Topic';
import Quiz from '../models/Quiz';
import Answer from '../models/Answer';
import Question from '../models/Question';
import mongoose from 'mongoose';

export const builderService = {
  /**
   * Get complete hierarchical tree for a course
   */
  async getFullTree(courseId) {
    const course = await Course.findById(courseId).lean();
    if (!course) throw new Error('Course not found');

    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).lean();
    const lessonIds = lessons.map(l => l._id);

    const topics = await Topic.find({ lesson: { $in: lessonIds } }).sort({ order: 1 }).lean();
    const quizzes = await Quiz.find({ course: courseId }).sort({ order: 1 }).lean();

    // Attach children to lessons
    const tree = lessons.map(lesson => ({
      ...lesson,
      topics: topics.filter(t => t.lesson.toString() === lesson._id.toString()),
      quizzes: quizzes.filter(q => q.lesson?.toString() === lesson._id.toString())
    }));

    return {
      course,
      structure: tree,
      standaloneQuizzes: quizzes.filter(q => !q.lesson && !q.topic)
    };
  },

  /**
   * Universal Item Adder (Lesson/Topic/Quiz)
   */
  async addItem(tenantId, parentType, parentId, itemType, data) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let newItem;
      const order = await this.getNextOrder(itemType, parentId);

      if (itemType === 'lesson') {
        newItem = new Lesson({ ...data, tenant: tenantId, course: parentId, order });
      } else if (itemType === 'topic') {
        newItem = new Topic({ ...data, tenant: tenantId, lesson: parentId, order });
      } else if (itemType === 'quiz') {
        const quizData = { ...data, tenant: tenantId, course: data.courseId, order };
        if (parentType === 'lesson') quizData.lesson = parentId;
        if (parentType === 'topic') quizData.topic = parentId;
        newItem = new Quiz(quizData);
      }

      await newItem.save({ session });
      await session.commitTransaction();
      return newItem;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async getNextOrder(type, parentId) {
    const Model = mongoose.model(type.charAt(0).toUpperCase() + type.slice(1));
    const filter = {};
    if (type === 'lesson') filter.course = parentId;
    if (type === 'topic') filter.lesson = parentId;
    if (type === 'quiz') filter.course = parentId; // Simplified

    const lastItem = await Model.findOne(filter).sort({ order: -1 });
    return lastItem ? lastItem.order + 1 : 0;
  }
};
