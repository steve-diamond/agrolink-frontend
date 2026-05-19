export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import User from 'models/User';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { status: 'error', message: 'Reset token is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { status: 'error', message: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ resetToken: token })
      .select('+resetToken +resetTokenExpiry +password');

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { status: 'error', message: 'Reset token is invalid or has expired.' },
        { status: 400 }
      );
    }

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return NextResponse.json({
      status: 'success',
      message: 'Password has been reset successfully.',
    });
  } catch (err: unknown) {
    console.error('[/api/auth/reset-password]', err);
    return NextResponse.json(
      { status: 'error', message: 'Unable to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
