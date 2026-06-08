export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { publicRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Cooperative = require('models/Cooperative');

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await publicRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await context.params;
    await dbConnect();

    const cooperative = await Cooperative.findById(id).lean();
    if (!cooperative) {
      return NextResponse.json({ status: 'error', message: 'Cooperative not found.' }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', data: { cooperative } });
  } catch (err: unknown) {
    return handleError(err);
  }
}
