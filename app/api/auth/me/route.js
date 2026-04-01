import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/modules/lms/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'lms_super_secret_key_2026';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      await dbConnect();
      const user = await User.findById(userId);

      if (!user) {
        return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth Check Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}
