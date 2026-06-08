export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server';
import { publicRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import { proxyToBackend } from 'lib/backendProxy';

export async function GET(req: NextRequest) {
  const rateLimitResponse = await publicRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    return await proxyToBackend(req, '/advisory');
  } catch (err: unknown) {
    return handleError(err);
  }
}
