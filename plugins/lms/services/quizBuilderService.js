import Quiz from '../models/Quiz';
import Question from '../models/Question';
import mongoose from 'mongoose';

export const quizBuilderService = {
  /**
   * Get full quiz structure for builder
   */
  async getQuizStructure(quizId) {
    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) throw new Error('Quiz not found');
    return quiz;
  },

  /**
   * Add a new question to a quiz
   */
  async addQuestion(tenantId, quizId, questionData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const questionCount = await Question.countDocuments({ quiz: quizId });
      
      const question = new Question({
        ...questionData,
        tenant: tenantId,
        quiz: quizId,
        order: questionCount
      });
      await question.save({ session });

      const quiz = await Quiz.findById(quizId);
      quiz.questions.push(question._id);
      
      // Update total points
      quiz.totalPoints = (quiz.totalPoints || 0) + (question.points || 0);
      
      await quiz.save({ session });

      await session.commitTransaction();
      return question;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Update an existing question
   */
  async updateQuestion(questionId, updateData) {
    const oldQuestion = await Question.findById(questionId);
    if (!oldQuestion) throw new Error('Question not found');

    const question = await Question.findByIdAndUpdate(
      questionId,
      { $set: updateData },
      { new: true }
    );

    // If points changed, update the quiz total points
    if (updateData.points !== undefined && updateData.points !== oldQuestion.points) {
      const quiz = await Quiz.findById(question.quiz);
      if (quiz) {
        quiz.totalPoints = quiz.totalPoints - oldQuestion.points + question.points;
        await quiz.save();
      }
    }

    return question;
  },

  /**
   * Remove a question from a quiz
   */
  async removeQuestion(quizId, questionId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const question = await Question.findById(questionId);
      if (!question) throw new Error('Question not found');

      await Quiz.findByIdAndUpdate(quizId, {
        $pull: { questions: questionId }
      }, { session });

      // Update total points
      const quiz = await Quiz.findById(quizId);
      quiz.totalPoints = Math.max(0, (quiz.totalPoints || 0) - (question.points || 0));
      await quiz.save({ session });

      // We don't delete from Question bank necessarily, but if it belongs only to this quiz:
      await Question.findByIdAndDelete(questionId, { session });

      await session.commitTransaction();
      return { success: true };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Bulk add questions (used for importing from bank)
   */
  async bulkAddQuestions(tenantId, quizId, questionsData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const quiz = await Quiz.findById(quizId);
      let currentOrder = await Question.countDocuments({ quiz: quizId });
      let addedPoints = 0;

      const newQuestionIds = [];
      const newQuestions = [];

      for (const data of questionsData) {
        // Strip out fields that shouldn't be copied or should be reset
        const { _id, createdAt, updatedAt, ...cleanData } = data;
        
        const question = new Question({
          ...cleanData,
          tenant: tenantId,
          quiz: quizId,
          order: currentOrder++
        });
        
        await question.save({ session });
        newQuestionIds.push(question._id);
        newQuestions.push(question);
        addedPoints += (question.points || 0);
      }

      quiz.questions.push(...newQuestionIds);
      quiz.totalPoints = (quiz.totalPoints || 0) + addedPoints;
      await quiz.save({ session });

      await session.commitTransaction();
      return newQuestions;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  /**
   * Search question bank
   */
  async searchBank(tenantId, query, tags) {
    const filter = { tenant: tenantId };
    if (query) filter.text = { $regex: query, $options: 'i' };
    if (tags && tags.length > 0) filter.tags = { $in: tags };
    
    return await Question.find(filter).limit(20);
  }
};
