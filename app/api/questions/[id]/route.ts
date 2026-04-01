import { deleteQuestion, getQuestion, updateQuestion } from '@/modules/lms/controllers/questionController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(getQuestion, 'Failed to load question');
export const PUT = withErrorHandling(updateQuestion, 'Failed to update question');
export const DELETE = withErrorHandling(deleteQuestion, 'Failed to delete question');
