import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Internship from '../models/Internship';

export async function GET_INTERNSHIPS(request) {
  try {
    await dbConnect();
    const interns = await Internship.find({})
      .sort({ createdAt: -1 })
      .populate('employer', 'companyName logo industry');
    return NextResponse.json({ success: true, data: interns });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function CREATE_INTERNSHIP(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const intern = await Internship.create(body);
    return NextResponse.json({ success: true, data: intern }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET_INTERNSHIP_BY_ID(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const intern = await Internship.findById(id).populate('employer');
    if (!intern) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: intern });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function UPDATE_INTERNSHIP(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const intern = await Internship.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: intern });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE_INTERNSHIP(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    await Internship.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
