export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from 'lib/mongoose';
import InsuranceApplication from 'models/InsuranceApplication';
import { sendSMS } from 'lib/sms';
import { handleError } from 'lib/errorHandler';
import { apiRateLimit } from 'lib/rateLimit';
import { validateBody } from 'lib/validators';

const insuranceApplicationSchema = z.object({
  full_name: z.string().min(2).max(150),
  bvn: z.string().length(11).regex(/^\d+$/),
  phone: z.string().min(7).max(20),
  state: z.string().min(2).max(100),
  lga: z.string().min(2).max(100),
  farm_size_ha: z.coerce.number().positive(),
  crop_type: z.string().min(2).max(100),
  planting_date: z.string().min(4),
  harvest_date: z.string().min(4),
  plan: z.enum(['basic', 'standard', 'premium']),
  bank_name: z.string().min(2).max(120),
  account_number: z.string().min(10).max(20),
});

export async function POST(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const data = validateBody(insuranceApplicationSchema, body);

    await dbConnect();

    let premium_amount = 5000;
    let coverage_amount = 150000;
    if (data.plan === 'standard') {
      premium_amount = 12000;
      coverage_amount = 400000;
    } else if (data.plan === 'premium') {
      premium_amount = 25000;
      coverage_amount = 1000000;
    }

    const application = await InsuranceApplication.create({
      ...data,
      premium_amount,
      coverage_amount,
      status: 'pending',
    });

    await sendSMS(data.phone, `Your DosAgrolink insurance application was received. We will contact you after review.`);
    return NextResponse.json({
      success: true,
      data: {
        applicationId: String(application._id),
        premium_amount,
        coverage_amount,
      },
    });
  } catch (err: unknown) {
    return handleError(err);
  }
}
