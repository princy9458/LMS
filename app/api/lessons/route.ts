import { createLesson, listLessons } from '@/modules/lms/controllers/lessonController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(listLessons, 'Failed to load lessons');
export const POST = withErrorHandling(createLesson);
