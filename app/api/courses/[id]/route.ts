import { deleteCourse, getCourse, updateCourse } from '@/modules/lms/controllers/courseController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(getCourse, 'Failed to load course');
export const PUT = withErrorHandling(updateCourse, 'Failed to update course');
export const DELETE = withErrorHandling(deleteCourse, 'Failed to delete course');
