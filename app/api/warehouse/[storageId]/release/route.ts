export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server';
import { apiRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import { proxyToBackend } from 'lib/backendProxy';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ storageId: string }> }
) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { storageId } = await context.params;
    return await proxyToBackend(req, `/warehouses/bookings/${encodeURIComponent(storageId)}/release`, {
      method: 'PATCH',
      jsonBody: {},
      includeQuery: false,
    });
  } catch (err: unknown) {
    return handleError(err);
  }
}
