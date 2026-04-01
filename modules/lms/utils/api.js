import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';

export function json(data, status = 200) {
  let payload = data;
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    payload = { ...payload };
    if (Object.prototype.hasOwnProperty.call(payload, 'success')) {
      if (!Object.prototype.hasOwnProperty.call(payload, 'data')) {
        payload.data = null;
      }
      if (!Object.prototype.hasOwnProperty.call(payload, 'message') && payload.error) {
        payload.message = payload.error;
      }
    }
  }
  return NextResponse.json(payload, { status });
}

export function badRequest(message, details) {
  return json({ success: false, data: null, message, error: message, details }, 400);
}

export function withErrorHandling(handler, fallbackMessage) {
  return async (request, context) => {
    try {
      await dbConnect();
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      const message = fallbackMessage || error.message || 'Server Error';
      return json(
        { success: false, data: null, message, error: message },
        error.statusCode || 500
      );
    }
  };
}

export function normalizeStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
