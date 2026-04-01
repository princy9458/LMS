import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const response = NextResponse.json({ success: true, data: {} });
    
    // Clear the token cookie
    response.cookies.set('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // Expire immediately
      httpOnly: true,
      path: '/'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
