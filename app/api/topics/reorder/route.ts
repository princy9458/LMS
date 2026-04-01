import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Topic from '@/modules/lms/models/Topic';

export async function POST(request: Request) {
  try {
    const { topics } = await request.json();
    if (!Array.isArray(topics)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    await dbConnect();
    const bulkOps = topics.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order }
      }
    }));
    if (bulkOps.length > 0) {
      await Topic.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
