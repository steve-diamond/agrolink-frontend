export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAdmin } from 'lib/adminAuth';
import User from 'models/User';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = verifyAdmin(req);
  if ('error' in auth) return auth.error;

  const { userId } = await params;
  await dbConnect();
  await User.findByIdAndDelete(userId);
  return NextResponse.json({ status: 'success', message: 'User deleted.' });
}
