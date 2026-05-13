export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import FarmerApplication from 'models/FarmerApplication';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const applicationId = searchParams.get('applicationId')?.trim() ?? '';
  const email = searchParams.get('email')?.trim().toLowerCase() ?? '';
  const phone = searchParams.get('phone')?.trim() ?? '';

  if (!applicationId && !email && !phone) {
    return NextResponse.json(
      { status: 'error', message: 'Provide applicationId, email, or phone.' },
      { status: 400 }
    );
  }

  await dbConnect();

  const query: Record<string, unknown> = {};
  if (applicationId) query['applicationId'] = applicationId;
  else if (email) query['account.email'] = email;
  else query['account.phone'] = phone;

  const application = await FarmerApplication.findOne(query).lean();

  if (!application) {
    return NextResponse.json(
      { status: 'error', message: 'No application found. Check your details and try again.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    applicationId: application.applicationId,
    status: application.status,
    account: application.account,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  });
}
