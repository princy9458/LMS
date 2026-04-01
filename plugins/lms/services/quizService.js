import Quiz from '../models/Quiz';
import Question from '../models/Question';
import Attempt from '../models/Attempt';
import Enrollment from '../models/Enrollment';

export const quizService = {
  /**
   * Get quiz with questions and answers
   */
  async getQuizData(quizId) {
    return await Quiz.findById(quizId).populate({
      path: 'questions',
      populate: { path: 'answers' }
    });
  },

  /**
   * Calculate score, log attempt, and update enrollment
   */
  async submitQuiz(userId, quizId, userAnswers, tenantId, duration) {
    const quiz = await Quiz.findById(quizId).populate({
      path: 'questions',
      populate: { path: 'answers' }
    });
    if (!quiz) throw new Error('Quiz not found');

    let correctCount = 0;
    const questions = quiz.questions;

    const processedAnswers = questions.map(q => {
      const userAnswerId = userAnswers[q._id.toString()];
      const correctAnswer = q.answers.find(a => a.isCorrect);
      const isCorrect = userAnswerId === correctAnswer?._id.toString();
      
      if (isCorrect) correctCount++;
      
      return {
        questionId: q._id,
        answerId: userAnswerId,
        isCorrect
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Log Attempt
    const attempt = await Attempt.create({
      tenant: tenantId,
      user: userId,
      quiz: quizId,
      score,
      passed,
      answers: processedAnswers,
      duration
    });

    // Update Enrollment if passed
    if (passed) {
      const enrollment = await Enrollment.findOne({ user: userId, course: quiz.course });
      if (enrollment && !enrollment.completedQuizzes.includes(quizId)) {
        enrollment.completedQuizzes.push(quizId);
        await enrollment.save();
      }
    }

    return {
      score,
      passed,
      attemptId: attempt._id,
      correctCount,
      totalCount: questions.length,
      passingScore: quiz.passingScore
    };
  }
};
