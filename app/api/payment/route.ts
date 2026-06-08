export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import { proxyToBackend } from 'lib/backendProxy';

export async function GET(req: NextRequest) {
	const rateLimitResponse = await apiRateLimit(req);
	if (rateLimitResponse) return rateLimitResponse;

	try {
		const reference = req.nextUrl.searchParams.get('reference')?.trim();
		if (!reference) {
			return NextResponse.json(
				{ status: 'error', message: 'reference query parameter is required.' },
				{ status: 400 }
			);
		}

		return await proxyToBackend(req, `/payment/verify/${encodeURIComponent(reference)}`, {
			includeQuery: false,
		});
	} catch (err: unknown) {
		return handleError(err);
	}
}