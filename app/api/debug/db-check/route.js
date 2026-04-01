import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';

export async function GET() {
  try {
    await dbConnect();
    const { readyState, name, host } = mongoose.connection;

    return NextResponse.json({
      success: true,
      readyState,
      db: name,
      host,
    });
  } catch (error) {
    console.error('[DB-CHECK] Connection failed:', error);
    return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
  }
}
