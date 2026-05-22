export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { dbConnect } from 'lib/mongoose';
import User from 'models/User';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { status: 'error', message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      { expiresIn }
    );

    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...safeUser } = userObj;

    const response = NextResponse.json({
      status: 'success',
      data: { user: safeUser, token },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/auth/login]', message);

    // Surface actionable hints in the response (no secrets leaked)
    if (message.includes('MONGODB_URI')) {
      return NextResponse.json(
        { status: 'error', message: 'Server is not configured. Contact support.' },
        { status: 503 }
      );
    }
    if (message.includes('ECONNREFUSED') || message.includes('timed out') || message.includes('ETIMEDOUT') || message.includes('querySrv')) {
      return NextResponse.json(
        { status: 'error', message: 'Database is temporarily unreachable. Try again in a moment.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to process login. Please try again.' },
      { status: 500 }
    );
  }
}
