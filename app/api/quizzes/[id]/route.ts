import { deleteQuiz, getQuiz, updateQuiz } from '@/modules/lms/controllers/quizController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(getQuiz, 'Failed to load quiz');
export const PUT = withErrorHandling(updateQuiz, 'Failed to update quiz');
export const DELETE = withErrorHandling(deleteQuiz, 'Failed to delete quiz');
