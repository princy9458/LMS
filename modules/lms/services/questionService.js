import Quiz from '@/modules/lms/models/Quiz';
import Question from '@/modules/lms/models/Question';

export const questionService = {
  async createQuestion(data) {
    const question = await Question.create(data);

    if (question.quiz) {
      await Quiz.findByIdAndUpdate(
        question.quiz,
        { $addToSet: { questions: question._id } },
        { new: true }
      );
    }

    return question;
  },

  async attachAnswers(questionId, answerIds) {
    return Question.findByIdAndUpdate(
      questionId,
      { $addToSet: { answers: { $each: answerIds } } },
      { new: true }
    );
  },

  async listQuestionsByQuiz(quizId) {
    return Question.find({ quiz: quizId }).sort({ order: 1 });
  },

  async listQuestions() {
    return Question.find({}).sort({ createdAt: -1 });
  },

  async getQuestionById(id) {
    return Question.findById(id).populate('answers');
  },

  async updateQuestion(id, payload) {
    return Question.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true
    });
  },

  async deleteQuestion(id) {
    return Question.findByIdAndDelete(id);
  }
};
