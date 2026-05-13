export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAdmin } from 'lib/adminAuth';
import BuyerApplication from 'models/BuyerApplication';
import User from 'models/User';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const auth = verifyAdmin(req);
  if ('error' in auth) return auth.error;

  const { applicationId } = await params;
  await dbConnect();

  const application = await BuyerApplication.findOne({ applicationId });
  if (!application) {
    return NextResponse.json({ status: 'error', message: 'Application not found.' }, { status: 404 });
  }

  application.status = 'approved';
  await application.save();

  // Activate the user account linked to this application
  const email = application.account?.email;
  if (email) {
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { approved: true, role: 'buyer' }
    );
  }

  return NextResponse.json({ status: 'success', application });
}
