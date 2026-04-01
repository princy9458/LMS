import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Lesson from '@/plugins/lms/models/Lesson';

export async function POST(request, { params }) {
  try {
    const { lessons } = await request.json();
    await dbConnect();

    const bulkOps = lessons.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order }
      }
    }));

    await Lesson.bulkWrite(bulkOps);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
