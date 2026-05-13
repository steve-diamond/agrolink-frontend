export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAdmin } from 'lib/adminAuth';
import User from 'models/User';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if ('error' in auth) return auth.error;

  await dbConnect();
  const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users });
}
