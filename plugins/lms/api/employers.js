import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Employer from '../models/Employer';

export async function GET_EMPLOYERS(request) {
  try {
    await dbConnect();
    const employers = await Employer.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: employers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET_EMPLOYER_BY_ID(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const employer = await Employer.findById(id);
    if (!employer) return NextResponse.json({ success: false, error: 'Employer not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: employer });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function CREATE_EMPLOYER(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const employer = await Employer.create(body);
    return NextResponse.json({ success: true, data: employer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function UPDATE_EMPLOYER(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    // Support partial updates for verification etc
    const employer = await Employer.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ success: true, data: employer });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE_EMPLOYER(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const employer = await Employer.findByIdAndDelete(id);
    if (!employer) return NextResponse.json({ success: false, error: 'Employer not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Employer deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
