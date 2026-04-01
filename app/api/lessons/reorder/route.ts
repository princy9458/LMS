import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Lesson from '@/modules/lms/models/Lesson';

export async function POST(request: Request) {
  try {
    const { lessons } = await request.json();
    if (!Array.isArray(lessons)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    await dbConnect();
    const bulkOps = lessons.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order }
      }
    }));
    if (bulkOps.length > 0) {
      await Lesson.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
