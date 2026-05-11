import Lesson from '@/modules/lms/models/Lesson';
import Topic from '@/modules/lms/models/Topic';
import Quiz from '@/modules/lms/models/Quiz';

export const quizService = {
  async createQuiz(data) {
    const quiz = await Quiz.create(data);

    if (quiz.topic) {
      await Topic.findByIdAndUpdate(
        quiz.topic,
        { $addToSet: { quizzes: quiz._id } },
        { new: true }
      );
    }

    if (quiz.lesson) {
      await Lesson.findByIdAndUpdate(
        quiz.lesson,
        { $addToSet: { quizzes: quiz._id } },
        { new: true }
      );
    }

    return quiz;
  },

  async listQuizzes(filter = {}) {
    return Quiz.find(filter).sort({ createdAt: -1 });
  },

  async getQuizById(id) {
    return Quiz.findById(id).populate({ path: 'questions', populate: { path: 'answers' } });
  },

  async updateQuiz(id, payload) {
    const quiz = await Quiz.findById(id);
    if (!quiz) return null;
    quiz.set(payload);
    await quiz.save();
    return quiz;
  },

  async deleteQuiz(id) {
    return Quiz.findByIdAndDelete(id);
  }
};
