export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { dbConnect } from 'lib/mongoose';
import OtpSession from 'models/OtpSession';
import { sendSMS } from 'lib/sms';
import { handleError, logError } from 'lib/errorHandler';
import { authRateLimit } from 'lib/rateLimit';

const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length === 13) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 11) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  if (digits.startsWith('234')) return `+${digits}`;
  return input.trim();
}

export async function POST(req: NextRequest) {
  const rateLimitResponse = await authRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json() as { phone?: string };
    const rawPhone = (body.phone ?? '').trim();

    if (!rawPhone) {
      return NextResponse.json(
        { status: 'error', message: 'Phone number is required.' },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);
    if (!/^\+234\d{10}$/.test(phone)) {
      return NextResponse.json(
        { status: 'error', message: 'Enter a valid Nigerian phone number.' },
        { status: 400 }
      );
    }

    /* ---- Generate OTP ---- */
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const ref = randomBytes(16).toString('hex');
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    await dbConnect();

    /* Remove any existing session for this phone */
    await OtpSession.deleteMany({ phone });

    await OtpSession.create({ phone, ref, otpHash, attempts: 0, expiresAt });

    /* ---- Send SMS ---- */
    try {
      await sendSMS(phone, `Your DOS AgroLink verification code is: ${otp}. Valid for 10 minutes.`);
    } catch (smsErr) {
      logError('[OTP send] SMS delivery failed', smsErr as Error, { phone: phone.slice(0, 7) + '****' });
      // Only expose OTP in dev when SMS fails — never in production
      if (process.env.NODE_ENV !== 'production') {
        // Log to stderr (not stdout) — masked in non-dev environments
        logError('[DEV OTP fallback — NOT for production]', new Error(`${phone.slice(-4)} → ${otp}`));
      } else {
        return NextResponse.json(
          { status: 'error', message: 'Could not deliver OTP via SMS. Please try again.' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ status: 'success', data: { ref } });
  } catch (err: unknown) {
    return handleError(err);
  }
}
