export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from 'lib/mongoose';
import { authRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import { validateBody } from 'lib/validators';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Cooperative = require('models/Cooperative');

const cooperativeRegistrationSchema = z.object({
  name: z.string().min(2).max(200),
  cac_reg_number: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  lga: z.string().min(2).max(100),
  year_founded: z.coerce.number().int().min(1900).max(2100),
  primary_commodity: z.string().min(2).max(100),
  member_count: z.coerce.number().int().min(1).max(1_000_000),
  chairman_name: z.string().min(2).max(200),
  chairman_phone: z.string().min(7).max(25),
  chairman_email: z.string().email(),
  secretary_name: z.string().min(2).max(200),
  secretary_phone: z.string().min(7).max(25),
  secretary_email: z.string().email(),
  photo_url: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const rateLimitResponse = await authRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const formData = await req.formData();

    const payload = validateBody(cooperativeRegistrationSchema, {
      name: formData.get('name'),
      cac_reg_number: formData.get('cac_reg_number'),
      state: formData.get('state'),
      lga: formData.get('lga'),
      year_founded: formData.get('year_founded'),
      primary_commodity: formData.get('primary_commodity'),
      member_count: formData.get('member_count'),
      chairman_name: formData.get('chairman_name'),
      chairman_phone: formData.get('chairman_phone'),
      chairman_email: formData.get('chairman_email'),
      secretary_name: formData.get('secretary_name'),
      secretary_phone: formData.get('secretary_phone'),
      secretary_email: formData.get('secretary_email'),
      photo_url: undefined,
    });

    await dbConnect();

    const existing = await Cooperative.findOne({
      cac_reg_number: payload.cac_reg_number,
    }).lean();

    if (existing) {
      return NextResponse.json(
        { status: 'error', message: 'A cooperative with this CAC registration number already exists.' },
        { status: 409 }
      );
    }

    const cooperative = await Cooperative.create(payload);

    return NextResponse.json({ status: 'success', data: { cooperative } }, { status: 201 });
  } catch (err: unknown) {
    return handleError(err);
  }
}
