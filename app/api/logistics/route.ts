export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server';
import { handleError } from 'lib/errorHandler';
import { apiRateLimit } from 'lib/rateLimit';
import { proxyToBackend } from 'lib/backendProxy';

export async function GET(req: NextRequest) {
	const rateLimitResponse = await apiRateLimit(req);
	if (rateLimitResponse) return rateLimitResponse;

	try {
		return await proxyToBackend(req, '/logistics');
	} catch (err: unknown) {
		return handleError(err);
	}
}

export async function POST(req: NextRequest) {
	const rateLimitResponse = await apiRateLimit(req);
	if (rateLimitResponse) return rateLimitResponse;

	try {
		return await proxyToBackend(req, '/logistics');
	} catch (err: unknown) {
		return handleError(err);
	}
}