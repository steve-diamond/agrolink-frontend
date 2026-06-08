export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { dbConnect } from 'lib/mongoose';
import User from 'models/User';
import { handleError } from 'lib/errorHandler';
import { authRateLimit } from 'lib/rateLimit';
import { Schemas, validateBody } from 'lib/validators';

export async function POST(req: NextRequest) {
  const rateLimitResponse = await authRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { email, password } = validateBody(Schemas.login, body);

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
    return handleError(err);
  }
}
