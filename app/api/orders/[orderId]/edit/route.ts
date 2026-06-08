export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import { proxyToBackend } from 'lib/backendProxy';
import { validateBody } from 'lib/validators';

const updateOrderSchema = z.object({
  status: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { orderId } = await context.params;
    const body = await req.json();
    const { status } = validateBody(updateOrderSchema, body);

    return await proxyToBackend(req, `/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      jsonBody: { status },
      includeQuery: false,
    });
  } catch (err: unknown) {
    return handleError(err);
  }
}
