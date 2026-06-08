export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server';
import { apiRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import { proxyToBackend } from 'lib/backendProxy';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ shipmentId: string }> }
) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { shipmentId } = await context.params;
    return await proxyToBackend(req, `/logistics/${encodeURIComponent(shipmentId)}/status`, {
      method: 'PATCH',
      jsonBody: { status: 'cancelled' },
      includeQuery: false,
    });
  } catch (err: unknown) {
    return handleError(err);
  }
}
