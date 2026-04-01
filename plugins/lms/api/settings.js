import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { settingsService } from '../services/settingsService';

export async function GET_SETTINGS(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const group = searchParams.get('group');
    
    const settings = await settingsService.getSettings(group);
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function UPDATE_SETTINGS(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { settings, group } = body;
    
    if (!settings || !group) {
      return NextResponse.json({ success: false, error: 'Settings and group are required' }, { status: 400 });
    }

    const result = await settingsService.updateSettings(settings, group);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
