import { createCourse, listCourses } from '@/modules/lms/controllers/courseController';
import { withErrorHandling } from '@/modules/lms/utils/api';

export const GET = withErrorHandling(listCourses);
export const POST = withErrorHandling(createCourse);
