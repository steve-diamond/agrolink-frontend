export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from 'lib/mongoose';
import { verifyAuth } from 'lib/auth';
import { apiRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import { validateBody } from 'lib/validators';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ProduceGrade = require('models/ProduceGrade');

const gradingSubmitSchema = z.object({
  commodity: z.string().min(2).max(100),
  grade: z.enum(['A', 'B', 'C']),
  criteria_met: z.record(z.string(), z.boolean()),
  photos: z.array(z.string()).min(1).max(6),
  listing_id: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = verifyAuth(req);
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const payload = validateBody(gradingSubmitSchema, body);

    await dbConnect();

    const badgeByGrade: Record<'A' | 'B' | 'C', string> = {
      A: '/images/grade-a.png',
      B: '/images/grade-b.png',
      C: '/images/grade-c.png',
    };

    const saved = await ProduceGrade.create({
      listing_id: payload.listing_id,
      farmer_id: auth.payload.id,
      commodity: payload.commodity,
      grade: payload.grade,
      criteria_met: payload.criteria_met,
      photos: payload.photos,
      grade_badge_url: badgeByGrade[payload.grade],
      verified_by_agent: false,
    });

    return NextResponse.json(
      {
        status: 'success',
        data: {
          id: saved._id,
          grade: payload.grade,
          badgeUrl: badgeByGrade[payload.grade],
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    return handleError(err);
  }
}
