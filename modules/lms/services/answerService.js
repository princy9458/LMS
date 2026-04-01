import Answer from '@/modules/lms/models/Answer';
import { resolveLocalizedField } from '@/modules/lms/utils/courseLocalization';

export const answerService = {
  async createAnswers(questionId, answers, tenant) {
    const payload = answers.map((answer, index) => ({
      question: questionId,
      text: resolveLocalizedField(answer.text),
      isCorrect: Boolean(answer.isCorrect),
      order: answer.order ?? index,
      tenant
    }));

    return Answer.insertMany(payload);
  }
};
