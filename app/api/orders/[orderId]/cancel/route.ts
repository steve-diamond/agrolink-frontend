export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import { proxyToBackend } from 'lib/backendProxy';
import { validateBody } from 'lib/validators';

const cancelBodySchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { orderId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { reason } = validateBody(cancelBodySchema, body);

    return await proxyToBackend(req, `/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      jsonBody: {
        status: 'cancelled',
        reason,
      },
      includeQuery: false,
    });
  } catch (err: unknown) {
    return handleError(err);
  }
}
