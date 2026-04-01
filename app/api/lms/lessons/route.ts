import { createLesson, listLessons } from '@/modules/lms/controllers/lessonController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(listLessons);
export const POST = withErrorHandling(createLesson);
