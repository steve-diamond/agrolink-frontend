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

const loanApplicationSchema = z.object({
	amountNeeded: z.number().positive().optional(),
	amount: z.number().positive().optional(),
	loanPurpose: z.string().min(1).optional(),
	purpose: z.string().min(1).optional(),
	repaymentPeriod: z.string().min(1).optional(),
	requestedTermMonths: z.number().int().positive().optional(),
	farmSize: z.number().positive().optional(),
	cooperativeRating: z.number().optional(),
	salesScore: z.number().optional(),
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

		if (body && typeof body === 'object' && 'loanId' in body) {
			const { loanId } = validateBody(repaySchema, body);

			return await proxyToBackend(req, `/loans/${encodeURIComponent(loanId)}/repay`, {
				method: 'PATCH',
				jsonBody: {},
				includeQuery: false,
			});
		}

		const validated = validateBody(loanApplicationSchema, body);
		const amount = Number(validated.amount ?? validated.amountNeeded ?? 0);
		const purpose = String(validated.purpose ?? validated.loanPurpose ?? '').trim();
		const requestedTermMonths = Number(
			validated.requestedTermMonths ?? Number.parseInt(String(validated.repaymentPeriod ?? '0'), 10)
		);

		if (!Number.isFinite(amount) || amount <= 0) {
			return NextResponse.json({ status: 'error', message: 'Loan amount is required.' }, { status: 400 });
		}

		if (!purpose) {
			return NextResponse.json({ status: 'error', message: 'Loan purpose is required.' }, { status: 400 });
		}

		if (!Number.isFinite(requestedTermMonths) || requestedTermMonths <= 0) {
			return NextResponse.json({ status: 'error', message: 'Repayment period is required.' }, { status: 400 });
		}

		return await proxyToBackend(req, '/loans', {
			method: 'POST',
			jsonBody: {
				amount,
				purpose,
				farmSize: validated.farmSize,
				cooperativeRating: validated.cooperativeRating,
				salesScore: validated.salesScore,
				requestedTermMonths,
			},
			includeQuery: false,
		});
	} catch (err: unknown) {
		return handleError(err);
	}
}