import { createQuestion, listQuestions } from '@/modules/lms/controllers/questionController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(listQuestions, 'Failed to load questions');
export const POST = withErrorHandling(createQuestion);
