import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { quizBuilderService } from '@/plugins/lms/services/quizBuilderService';
import { requireAdmin } from '@/plugins/lms/middleware/authMiddleware';

export async function PATCH(request: Request, { params }: { params: { questionId: string } }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { questionId } = params;
    const body = await request.json();
    
    await dbConnect();
    const question = await quizBuilderService.updateQuestion(questionId, body);
    
    return NextResponse.json(question);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
