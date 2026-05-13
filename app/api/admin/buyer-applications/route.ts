export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAdmin } from 'lib/adminAuth';
import BuyerApplication from 'models/BuyerApplication';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if ('error' in auth) return auth.error;

  await dbConnect();
  const applications = await BuyerApplication.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ applications });
}
