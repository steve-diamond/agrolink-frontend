export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAdmin } from 'lib/adminAuth';
import User from 'models/User';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = verifyAdmin(req);
  if ('error' in auth) return auth.error;

  const { userId } = await params;
  await dbConnect();
  const user = await User.findByIdAndUpdate(
    userId,
    { approved: true },
    { new: true }
  ).select('-password');

  if (!user) {
    return NextResponse.json({ status: 'error', message: 'User not found.' }, { status: 404 });
  }
  return NextResponse.json({ status: 'success', user });
}
