import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { quizService } from '../services/quizService';
import { requireStudent } from '../middleware/authMiddleware';
import { QuizSubmissionSchema } from '../validation/lmsSchemas';

export async function SUBMIT_QUIZ(request) {
  try {
    const auth = await requireStudent(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const validated = QuizSubmissionSchema.parse(body);

    await dbConnect();
    const result = await quizService.submitQuiz(auth.user.userId, validated.quizId, validated.answers);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
