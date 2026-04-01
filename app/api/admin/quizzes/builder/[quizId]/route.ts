import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { quizBuilderService } from '@/plugins/lms/services/quizBuilderService';
import { requireAdmin } from '@/plugins/lms/middleware/authMiddleware';

export async function GET(request: Request, { params }: { params: { quizId: string } }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { quizId } = params;
    await dbConnect();
    const quiz = await quizBuilderService.getQuizStructure(quizId);
    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
