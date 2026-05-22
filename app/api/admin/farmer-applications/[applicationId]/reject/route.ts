export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAdmin } from 'lib/adminAuth';
import FarmerApplication from 'models/FarmerApplication';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const auth = verifyAdmin(req);
  if ('error' in auth) return auth.error;

  const { applicationId } = await params;
  await dbConnect();

  const application = await FarmerApplication.findOne({ applicationId });
  if (!application) {
    return NextResponse.json({ status: 'error', message: 'Application not found.' }, { status: 404 });
  }

  application.status = 'rejected';
  await application.save();

  return NextResponse.json({ status: 'success', application });
}
