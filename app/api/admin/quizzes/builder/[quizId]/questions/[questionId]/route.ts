import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { quizBuilderService } from '@/plugins/lms/services/quizBuilderService';
import { requireAdmin } from '@/plugins/lms/middleware/authMiddleware';

export async function DELETE(request: Request, { params }: { params: { quizId: string, questionId: string } }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { quizId, questionId } = params;
    
    await dbConnect();
    await quizBuilderService.removeQuestion(quizId, questionId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
