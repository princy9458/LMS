import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { builderService } from '../services/builderService';

export async function GET_STRUCTURE(request, { params }) {
  try {
    await dbConnect();
    const structure = await builderService.getCourseStructure(params.courseId);
    return NextResponse.json({ success: true, data: structure });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function UPDATE_ORDER(request) {
  try {
    await dbConnect();
    const { type, items } = await request.json();
    await builderService.updateOrder(type, items);
    return NextResponse.json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function ADD_ITEM(request) {
  try {
    await dbConnect();
    const { type, data } = await request.json();
    const newItem = await builderService.addItem(type, data);
    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
