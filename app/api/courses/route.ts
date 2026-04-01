import { createCourse, listCourses } from '@/modules/lms/controllers/courseController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(listCourses, 'Failed to load courses');
export const POST = withErrorHandling(createCourse);
