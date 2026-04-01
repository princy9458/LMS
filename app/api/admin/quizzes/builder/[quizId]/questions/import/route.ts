import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { quizBuilderService } from '@/plugins/lms/services/quizBuilderService';
import { requireAdmin } from '@/plugins/lms/middleware/authMiddleware';

export async function POST(request: Request, { params }: { params: { quizId: string } }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { quizId } = params;
    const { questions } = await request.json();
    
    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid questions data' }, { status: 400 });
    }

    await dbConnect();
    const importedQuestions = await quizBuilderService.bulkAddQuestions(auth.user.tenantId, quizId, questions);
    
    return NextResponse.json(importedQuestions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
