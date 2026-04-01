import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/modules/lms/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'lms_super_secret_key_2026';
const isDev = process.env.NODE_ENV !== 'production';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    const url = new URL(request.url);
    if (isDev) console.log(`[ADMIN AUTH] POST ${url.pathname} - Attempt for: ${email}`);

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Check for user & select password
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      if (isDev) console.log(`[ADMIN AUTH] Error: User ${normalizedEmail} not found in database.`);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (isDev) console.log(`[ADMIN AUTH] Found User: ${user.email}, DB Role: ${user.role}`);

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (isDev) console.log(`[ADMIN AUTH] Login Password Match: ${isMatch}`);
    
    if (!isMatch) {
      if (isDev) console.log(`[ADMIN AUTH] Error: Password mismatch for ${normalizedEmail}.`);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Robust Admin Role Check
    if (user.role?.toLowerCase() !== "admin") {
      if (isDev) console.log(`[ADMIN AUTH] Error: User ${normalizedEmail} has role ${user.role}, but 'admin' is required.`);
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    // JWT with userId and role
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
      { status: 200 }
    );

    response.cookies.set('token', token, options);
    return response;

  } catch (error) {
    console.error('Admin Login error:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
