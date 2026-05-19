export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import User from 'models/User';
import { verifyAuth } from 'lib/auth';

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();
    const user = await User.findById(auth.payload.id).lean();

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'User not found.' },
        { status: 404 }
      );
    }

    const userObj = user as Record<string, unknown>;
    delete userObj.password;
    delete userObj.resetToken;
    delete userObj.resetTokenExpiry;

    return NextResponse.json({ status: 'success', data: { user: userObj } });
  } catch (err: unknown) {
    console.error('[/api/auth/me]', err);
    return NextResponse.json(
      { status: 'error', message: 'Unable to retrieve user.' },
      { status: 500 }
    );
  }
}
