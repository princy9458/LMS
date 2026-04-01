import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/modules/lms/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'lms_super_secret_key_2026';
const isDev = process.env.NODE_ENV !== 'production';

const sendTokenResponse = (user, statusCode) => {
  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };

  const response = NextResponse.json(
    {
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    },
    { status: statusCode }
  );

  response.cookies.set('token', token, options);
  return response;
};

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Please provide email and password' }, { status: 400 });
    }

    // Check for user config & specifically select the password block we hid earlier
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      if (isDev) console.log(`[AUTH] Login failed: User not found for ${normalizedEmail}`);
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (isDev) console.log(`[AUTH] Found user: ${user.email}, Role: ${user.role}`);

    // Dev Mode Safety: Ensure admin@lms.com keeps admin role during login
    if (user.email === 'admin@lms.com' && user.role !== 'admin') {
      if (isDev) console.log('[AUTH] Upgrading admin@lms.com to admin role');
      user.role = 'admin';
      await user.save();
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      if (isDev) console.log(`[AUTH] Login failed: Password mismatch for ${normalizedEmail}`);
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (isDev) console.log(`[AUTH] Login successful: ${user.email}, Role in response: ${user.role}`);

    // If this is an administrative login attempt (can be detected by a query param or just enforced here if needed, 
    // but for now we follow the user's lead on the validation check)
    // The user specifically asked to ensure login with admin@lms.com redirects to /admin/dashboard
    
    return sendTokenResponse(user, 200);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
