import { createQuiz, listQuizzes } from '@/modules/lms/controllers/quizController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(listQuizzes, 'Failed to load quizzes');
export const POST = withErrorHandling(createQuiz);
