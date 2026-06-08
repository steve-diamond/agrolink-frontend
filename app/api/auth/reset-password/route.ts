export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
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
    const { token, password } = validateBody(Schemas.resetPassword, body);

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
    return handleError(err);
  }
}
