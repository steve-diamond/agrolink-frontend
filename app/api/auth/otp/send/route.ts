export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { dbConnect } from 'lib/mongoose';
import OtpSession from 'models/OtpSession';
import { sendSMS } from 'lib/sms';

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
      console.error('[OTP send] SMS delivery failed:', smsErr);
      /* In development / if AT credentials absent, log OTP to console */
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV OTP] ${phone} → ${otp}`);
      } else {
        return NextResponse.json(
          { status: 'error', message: 'Could not deliver OTP via SMS. Please try again.' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ status: 'success', data: { ref } });
  } catch (err: unknown) {
    console.error('[/api/auth/otp/send]', err);
    return NextResponse.json(
      { status: 'error', message: 'Could not send OTP. Please try again later.' },
      { status: 500 }
    );
  }
}
