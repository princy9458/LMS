import { deleteLesson, getLesson, updateLesson } from '@/modules/lms/controllers/lessonController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(getLesson, 'Failed to load lesson');
export const PUT = withErrorHandling(updateLesson, 'Failed to update lesson');
export const DELETE = withErrorHandling(deleteLesson, 'Failed to delete lesson');
