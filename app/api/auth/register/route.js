import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/modules/lms/models/User';
import jwt from 'jsonwebtoken';

// In a real app, this MUST be an environment variable. Using a fallback for demo purposes.
const JWT_SECRET = process.env.JWT_SECRET || 'lms_super_secret_key_2026';

const sendTokenResponse = (user, statusCode) => {
  // Create token
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: '30d',
  });

  // Create cookie options
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true, // the cookie cannot be accessed by client side scripts
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };

  const response = NextResponse.json(
    {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
    { status: statusCode }
  );

  // Set cookie
  response.cookies.set('token', token, options);

  return response;
};

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide all details' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student', // Default to student
    });

    return sendTokenResponse(user, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server Error' },
      { status: 500 }
    );
  }
}
