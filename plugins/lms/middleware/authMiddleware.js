import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lms_super_secret_key_2026';

export const requireRole = (role) => async (request) => {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return { error: 'Authentication required', status: 401 };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (role && decoded.role?.toLowerCase() !== role.toLowerCase()) {
      return { error: `Access denied. ${role} role required.`, status: 403 };
    }
    return { user: decoded };
  } catch (error) {
    return { error: 'Invalid or expired token', status: 401 };
  }
};

export const requireStudent = requireRole('student');
export const requireEmployer = requireRole('employer');
export const requireAdmin = requireRole('admin');
