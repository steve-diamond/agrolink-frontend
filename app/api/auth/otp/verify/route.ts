export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { dbConnect } from 'lib/mongoose';
import OtpSession from 'models/OtpSession';
import User from 'models/User';

const MAX_ATTEMPTS = 5;

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 11) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  if (digits.startsWith('234')) return `+${digits}`;
  return input.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { phone?: string; otp?: string; ref?: string; role?: string };
    const { otp, ref, role } = body;
    const rawPhone = (body.phone ?? '').trim();

    if (!rawPhone || !otp || !ref) {
      return NextResponse.json(
        { status: 'error', message: 'Phone, OTP, and ref are required.' },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);

    await dbConnect();

    const session = await OtpSession.findOne({ phone, ref });
    if (!session) {
      return NextResponse.json(
        { status: 'error', message: 'OTP session not found or has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    if (session.expiresAt < new Date()) {
      await OtpSession.deleteOne({ _id: session._id });
      return NextResponse.json(
        { status: 'error', message: 'OTP has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    /* ---- Rate limit attempts ---- */
    if (session.attempts >= MAX_ATTEMPTS) {
      await OtpSession.deleteOne({ _id: session._id });
      return NextResponse.json(
        { status: 'error', message: 'Too many failed attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    const isValid = await bcrypt.compare(otp.trim(), session.otpHash);
    if (!isValid) {
      session.attempts += 1;
      await session.save();
      const remaining = MAX_ATTEMPTS - session.attempts;
      return NextResponse.json(
        { status: 'error', message: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
        { status: 400 }
      );
    }

    /* ---- OTP valid — clean up session ---- */
    await OtpSession.deleteOne({ _id: session._id });

    /* ---- Find or create user ---- */
    let user = await User.findOne({ phone });

    if (!user) {
      const generatedPassword = `OTPAUTH_${randomBytes(24).toString('hex')}`;
      user = await User.create({
        name: `AgroLink User`,
        email: `${phone.replace('+', '')}@phone.agrolink.ng`,
        password: generatedPassword,
        phone,
        role: role || 'buyer',
        approved: true,
      });
    }

    /* ---- Issue JWT ---- */
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { status: 'error', message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn });

    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...safeUser } = userObj;

    const response = NextResponse.json({ status: 'success', data: { user: safeUser, token } });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (err: unknown) {
    console.error('[/api/auth/otp/verify]', err);
    return NextResponse.json(
      { status: 'error', message: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
