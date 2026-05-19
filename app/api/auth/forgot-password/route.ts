export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from 'lib/mongoose';
import User from 'models/User';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { status: 'error', message: 'Email is required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+resetToken +resetTokenExpiry');

    if (!user) {
      // Return same response to avoid user enumeration
      return NextResponse.json({
        status: 'success',
        message: 'If that account exists, a reset link has been generated.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return NextResponse.json({
      status: 'success',
      message: 'Password reset token generated.',
      resetToken,
    });
  } catch (err: unknown) {
    console.error('[/api/auth/forgot-password]', err);
    return NextResponse.json(
      { status: 'error', message: 'Unable to process reset request. Please try again.' },
      { status: 500 }
    );
  }
}
