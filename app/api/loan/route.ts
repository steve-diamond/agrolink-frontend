export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleError } from 'lib/errorHandler';
import { apiRateLimit } from 'lib/rateLimit';
import { proxyToBackend } from 'lib/backendProxy';
import { validateBody } from 'lib/validators';

const repaySchema = z.object({
	loanId: z.string().min(1, 'loanId is required'),
});

export async function GET(req: NextRequest) {
	const rateLimitResponse = await apiRateLimit(req);
	if (rateLimitResponse) return rateLimitResponse;

	try {
		return await proxyToBackend(req, '/loans/me', { includeQuery: false });
	} catch (err: unknown) {
		return handleError(err);
	}
}

export async function POST(req: NextRequest) {
	const rateLimitResponse = await apiRateLimit(req);
	if (rateLimitResponse) return rateLimitResponse;

	try {
		const body = await req.json();
		const { loanId } = validateBody(repaySchema, body);

		return await proxyToBackend(req, `/loans/${encodeURIComponent(loanId)}/repay`, {
			method: 'PATCH',
			jsonBody: {},
			includeQuery: false,
		});
	} catch (err: unknown) {
		return handleError(err);
	}
}