import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { settingsService } from '@/plugins/lms/services/settingsService';

export async function GET() {
  try {
    await dbConnect();
    const settings = await settingsService.getSettings('course');
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const settings = body?.settings;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Settings payload is required' },
        { status: 400 }
      );
    }

    const result = await settingsService.updateSettings(settings, 'course');
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}
