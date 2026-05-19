import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export interface JwtPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export function verifyAuth(req: NextRequest): { payload: JwtPayload } | { error: NextResponse } {
  const authHeader = req.headers.get('authorization') ?? '';
  const cookieToken = req.cookies.get('token')?.value ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : cookieToken;

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
    return { payload };
  } catch {
    return {
      error: NextResponse.json({ status: 'error', message: 'Invalid or expired token.' }, { status: 401 }),
    };
  }
}
