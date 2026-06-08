export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAuth } from 'lib/auth';
import { apiRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FarmCampaign = require('models/FarmCampaign');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Investment = require('models/Investment');

export async function GET(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = verifyAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();

    const [opportunities, investments] = await Promise.all([
      FarmCampaign.find({ status: 'active' })
        .sort({ created_at: -1 })
        .limit(6)
        .lean(),
      Investment.find({ investor_id: auth.payload.id })
        .sort({ investment_date: -1 })
        .lean(),
    ]);

    const totalInvested = investments.reduce(
      (sum: number, item: { amount_invested?: number }) => sum + Number(item.amount_invested ?? 0),
      0
    );

    const estimatedReturn = investments.reduce(
      (sum: number, item: { expected_return?: number }) => sum + Number(item.expected_return ?? 0),
      0
    );

    return NextResponse.json({
      status: 'success',
      data: {
        highlights: {
          totalInvested,
          estimatedReturn,
          activeProjects: investments.filter((item: { status?: string }) => item.status === 'active').length,
        },
        opportunities: opportunities.map(
          (campaign: {
            _id: string;
            title?: string;
            expected_return_pct?: number;
            duration_months?: number;
          }) => ({
            _id: campaign._id,
            title: String(campaign.title ?? 'Untitled campaign'),
            roiPct: Number(campaign.expected_return_pct ?? 0),
            durationMonths: Number(campaign.duration_months ?? 0),
          })
        ),
      },
    });
  } catch (err: unknown) {
    return handleError(err);
  }
}
