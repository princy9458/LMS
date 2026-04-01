console.log('[API] Jobs Logic Loading...');
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Job from '../models/Job';

/**
 * Modular API Handlers for Jobs (Plugin Layer)
 */

export async function GET_JOBS(request) {
  try {
    await dbConnect();
    const jobs = await Job.find({})
      .sort({ createdAt: -1 })
      .populate('employer', 'companyName logo');
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function CREATE_JOB(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const job = await Job.create(body);
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET_JOB_BY_ID(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const job = await Job.findById(id).populate('employer');
    if (!job) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function UPDATE_JOB(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const job = await Job.findByIdAndUpdate(id, body, { new: true });
    if (!job) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE_JOB(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const job = await Job.findByIdAndDelete(id);
    if (!job) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
