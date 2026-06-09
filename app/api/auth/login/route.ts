export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { dbConnect } from 'lib/mongoose';
import User from 'models/User';
import { handleError, logError } from 'lib/errorHandler';
import { authRateLimit } from 'lib/rateLimit';
import { Schemas, validateBody } from 'lib/validators';

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$/;

function authError(message: string, status = 401) {
  return NextResponse.json({ status: 'error', message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await authRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;
  } catch (error) {
    logError('[Auth Login] Rate limiter failed', error);
    return authError('Authentication service is temporarily unavailable. Please try again shortly.', 503);
  }

  try {
    let email = '';
    let password = '';

    try {
      const body = await req.json();
      const validated = validateBody(Schemas.login, body);
      email = validated.email;
      password = validated.password;
    } catch (error) {
      if (error instanceof SyntaxError) {
        return authError('Invalid request body. Please submit valid JSON.', 400);
      }
      return handleError(error);
    }

    try {
      await dbConnect();
    } catch (error) {
      logError('[Auth Login] DB connect failed', error);
      return authError('Login service is unavailable right now. Please try again in a moment.', 503);
    }

    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    } catch (error) {
      logError('[Auth Login] User lookup failed', error, { email: email.toLowerCase().trim() });
      return authError('Unable to verify your credentials right now. Please try again.', 503);
    }

    if (!user) {
      return authError('Invalid email or password.', 401);
    }

    const storedPassword = typeof user.password === 'string' ? user.password : '';
    if (!storedPassword) {
      return authError('Account is not configured for password login. Use Phone / OTP or reset your password.', 401);
    }

    const accountStatus = typeof user.status === 'string' ? user.status.toLowerCase() : 'active';
    if (accountStatus === 'inactive' || accountStatus === 'suspended' || accountStatus === 'blocked') {
      return authError('Your account is currently restricted. Please contact support.', 403);
    }

    let passwordMatches = false;
    try {
      if (typeof user.comparePassword === 'function') {
        passwordMatches = await user.comparePassword(password);
      }
    } catch {
      passwordMatches = false;
    }

    // Legacy compatibility: accept plain-text historical records once, then auto-upgrade to bcrypt.
    if (!passwordMatches && !BCRYPT_HASH_REGEX.test(storedPassword)) {
      passwordMatches = storedPassword === password;
      if (passwordMatches) {
        try {
          user.password = password;
          await user.save();
        } catch (error) {
          logError('[Auth Login] Legacy password upgrade failed', error, { userId: String(user._id) });
        }
      }
    }

    if (!passwordMatches) {
      return authError('Invalid email or password.', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logError('[Auth Login] Missing JWT secret', new Error('JWT_SECRET is not configured'));
      return authError('Login service is unavailable right now. Please try again in a moment.', 503);
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
