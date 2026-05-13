export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAdmin } from 'lib/adminAuth';
import FarmerApplication from 'models/FarmerApplication';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if ('error' in auth) return auth.error;

  await dbConnect();
  const applications = await FarmerApplication.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ applications });
}
