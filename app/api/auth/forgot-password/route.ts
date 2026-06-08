export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from 'lib/mongoose';
import User from 'models/User';
import { handleError, logError } from 'lib/errorHandler';
import { authRateLimit } from 'lib/rateLimit';
import { sendSMS } from 'lib/sms';

export async function POST(req: NextRequest) {
  const rateLimitResponse = await authRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json() as { email?: string };
    const email = (body.email ?? '').toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ status: 'error', message: 'Valid email is required.' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email })
      .select('+resetToken +resetTokenExpiry +phone');

    // Always return the same response to prevent user enumeration
    const safeResponse = NextResponse.json({
      status: 'success',
      message: 'If an account with that email exists, a reset code has been sent.',
    });

    if (!user) return safeResponse;

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send via SMS if phone is available; in production this should also be emailed
    if (user.phone) {
      const shortToken = resetToken.slice(0, 8).toUpperCase();
      await sendSMS(
        user.phone,
        `DOS AgroLink password reset code: ${shortToken}. Valid 1 hour. Visit /reset-password to use it.`
      ).catch((smsErr) => logError('[forgot-password] SMS failed', smsErr, { userId: String(user._id) }));
    }

    // In development: log token for testing (never in production)
    if (process.env.NODE_ENV !== 'production') {
      logError('[DEV] Password reset token', new Error(resetToken));
    }

    return safeResponse;
  } catch (err: unknown) {
    return handleError(err);
  }
}
