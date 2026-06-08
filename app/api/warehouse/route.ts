export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server';
import { apiRateLimit, publicRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import { proxyToBackend } from 'lib/backendProxy';

export async function GET(req: NextRequest) {
	const rateLimitResponse = await publicRateLimit(req);
	if (rateLimitResponse) return rateLimitResponse;

	try {
		return await proxyToBackend(req, '/warehouses');
	} catch (err: unknown) {
		return handleError(err);
	}
}

export async function POST(req: NextRequest) {
	const rateLimitResponse = await apiRateLimit(req);
	if (rateLimitResponse) return rateLimitResponse;

	try {
		return await proxyToBackend(req, '/warehouses/bookings', {
			method: 'POST',
			includeQuery: false,
		});
	} catch (err: unknown) {
		return handleError(err);
	}
}