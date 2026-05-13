import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

interface JwtPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export function verifyAdmin(req: NextRequest): { payload: JwtPayload } | { error: NextResponse } {
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return {
      error: NextResponse.json({ status: 'error', message: 'Authentication required.' }, { status: 401 }),
    };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return {
      error: NextResponse.json({ status: 'error', message: 'Server configuration error.' }, { status: 500 }),
    };
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    if (payload.role !== 'admin') {
      return {
        error: NextResponse.json({ status: 'error', message: 'Admin access required.' }, { status: 403 }),
      };
    }
    return { payload };
  } catch {
    return {
      error: NextResponse.json({ status: 'error', message: 'Invalid or expired token.' }, { status: 401 }),
    };
  }
}
