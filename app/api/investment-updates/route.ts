export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { dbConnect } from 'lib/mongoose';
import { verifyAuth } from 'lib/auth';
import { authRateLimit, publicRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import { validateBody } from 'lib/validators';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FarmCampaign = require('models/FarmCampaign');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const InvestmentUpdate = require('models/InvestmentUpdate');

const investmentUpdateSchema = z.object({
  campaignId: z.string().min(1),
  title: z.string().min(3).max(140),
  body: z.string().min(10).max(5000),
  photoUrls: z.array(z.string().url()).max(4).optional(),
});

export async function GET(req: NextRequest) {
  const rateLimitResponse = await publicRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const campaignId = req.nextUrl.searchParams.get('campaignId') || '';

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json({ status: 'error', message: 'Valid campaignId is required.' }, { status: 400 });
    }

    await dbConnect();

    const updates = await InvestmentUpdate.find({ campaign_id: campaignId })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ status: 'success', data: { updates } });
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  const rateLimitResponse = await authRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = verifyAuth(req);
  if ('error' in auth) return auth.error;

  try {
    if (!['farmer', 'admin', 'cooperative'].includes(String(auth.payload.role || '').toLowerCase())) {
      return NextResponse.json({ status: 'error', message: 'Only authorized farm accounts can post updates.' }, { status: 403 });
    }

    const payload = validateBody(investmentUpdateSchema, await req.json());

    if (!mongoose.Types.ObjectId.isValid(payload.campaignId)) {
      return NextResponse.json({ status: 'error', message: 'Invalid campaign id.' }, { status: 400 });
    }

    await dbConnect();

    const campaign = await FarmCampaign.findById(payload.campaignId)
      .select('_id farmer_id')
      .lean();

    if (!campaign) {
      return NextResponse.json({ status: 'error', message: 'Campaign not found.' }, { status: 404 });
    }

    const isOwner = String(campaign.farmer_id) === String(auth.payload.id);
    const isPrivileged = ['admin', 'cooperative'].includes(String(auth.payload.role || '').toLowerCase());

    if (!isOwner && !isPrivileged) {
      return NextResponse.json({ status: 'error', message: 'You cannot post updates to this campaign.' }, { status: 403 });
    }

    const created = await InvestmentUpdate.create({
      campaign_id: payload.campaignId,
      title: payload.title,
      body: payload.body,
      photo_urls: payload.photoUrls ?? [],
    });

    return NextResponse.json({ status: 'success', data: { update: created } }, { status: 201 });
  } catch (err: unknown) {
    return handleError(err);
  }
}
