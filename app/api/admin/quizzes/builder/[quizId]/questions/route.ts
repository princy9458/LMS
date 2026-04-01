import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { quizBuilderService } from '@/plugins/lms/services/quizBuilderService';
import { requireAdmin } from '@/plugins/lms/middleware/authMiddleware';

export async function POST(request: Request, { params }: { params: { quizId: string } }) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { quizId } = params;
    const body = await request.json();
    
    await dbConnect();
    const question = await quizBuilderService.addQuestion(auth.user.userId, quizId, body);
    
    return NextResponse.json(question);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const tags = searchParams.get('tags')?.split(',') || [];

    await dbConnect();
    const questions = await quizBuilderService.searchBank(auth.user.tenantId, query, tags);
    
    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
