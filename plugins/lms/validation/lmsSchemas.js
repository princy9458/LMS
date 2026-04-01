import { z } from 'zod';

export const CourseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  price: z.number().min(0),
  category: z.string(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced'])
});

export const QuizSubmissionSchema = z.object({
  quizId: z.string(),
  answers: z.union([z.array(z.string()), z.record(z.string())])
});

export const JobApplicationSchema = z.object({
  jobId: z.string(),
  notes: z.string().optional()
});

export const EnrollmentSchema = z.object({
  courseId: z.string()
});
