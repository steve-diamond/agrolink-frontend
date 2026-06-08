export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from 'lib/mongoose';
import { publicRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FarmCampaign = require('models/FarmCampaign');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Investment = require('models/Investment');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const rateLimitResponse = await publicRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { campaignId } = await params;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return NextResponse.json({ message: 'Invalid campaign id' }, { status: 400 });
    }

    await dbConnect();

    const campaign = await FarmCampaign.findById(campaignId)
      .populate('farmer_id', 'name full_name first_name last_name bio profile')
      .lean();

    if (!campaign) {
      return NextResponse.json({ message: 'Campaign not found' }, { status: 404 });
    }

    const investorCount = await Investment.countDocuments({ campaign_id: campaign._id });
    const farmer = campaign.farmer_id ?? {};

    const farmerName =
      String(
        farmer.full_name ||
          farmer.name ||
          [farmer.first_name, farmer.last_name].filter(Boolean).join(' ') ||
          'Verified farmer'
      ).trim() || 'Verified farmer';

    return NextResponse.json({
      status: 'success',
      data: {
        campaign: {
          id: String(campaign._id),
          title: String(campaign.title ?? `${campaign.crop_type ?? 'Farm'} Campaign`),
          cropType: String(campaign.crop_type ?? 'Mixed crops'),
          farmerName,
          farmerBio: String(farmer.bio ?? campaign.description ?? 'Campaign by a verified farm operator.'),
          state: String(campaign.state ?? 'Nigeria'),
          coverImageUrl: String(campaign.cover_image_url ?? '/placeholder.png'),
          gallery: [String(campaign.cover_image_url ?? '/placeholder.png')],
          raisedAmount: Number(campaign.raised_amount ?? 0),
          targetAmount: Number(campaign.target_amount ?? 0),
          expectedReturnPct: Number(campaign.expected_return_pct ?? 0),
          durationMonths: Number(campaign.duration_months ?? 0),
          minInvestment: Number(campaign.min_investment ?? 0),
          investorCount,
          status: String(campaign.status ?? 'active'),
        },
      },
    });
  } catch (err: unknown) {
    return handleError(err);
  }
}
