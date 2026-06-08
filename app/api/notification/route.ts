export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from 'lib/mongoose';
import { verifyAuth } from 'lib/auth';
import { handleError } from 'lib/errorHandler';
import { apiRateLimit } from 'lib/rateLimit';
import { validateBody } from 'lib/validators';
import Notification from 'models/Notification';

const createNotificationSchema = z.object({
	userId: z.string().min(1),
	message: z.string().min(1).max(1000),
});

export async function GET(req: NextRequest) {
	const rateLimitResponse = await apiRateLimit(req);
	if (rateLimitResponse) return rateLimitResponse;

	const auth = verifyAuth(req);
	if ('error' in auth) return auth.error;

	try {
		await dbConnect();
		const includeRead = req.nextUrl.searchParams.get('includeRead') === 'true';
		const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || 30)));

		const filter: Record<string, unknown> = { user: auth.payload.id };
		if (!includeRead) filter.read = false;

		const notifications = await Notification.find(filter)
			.sort({ createdAt: -1 })
			.limit(limit)
			.lean();

		return NextResponse.json({ status: 'success', data: { notifications } });
	} catch (err: unknown) {
		return handleError(err);
	}
}

export async function POST(req: NextRequest) {
	const rateLimitResponse = await apiRateLimit(req);
	if (rateLimitResponse) return rateLimitResponse;

	const auth = verifyAuth(req);
	if ('error' in auth) return auth.error;

	if (auth.payload.role !== 'admin') {
		return NextResponse.json({ status: 'error', message: 'Forbidden' }, { status: 403 });
	}

	try {
		const body = await req.json();
		const { userId, message } = validateBody(createNotificationSchema, body);

		await dbConnect();
		const notification = await Notification.create({ user: userId, message, read: false });

		return NextResponse.json({ status: 'success', data: { notification } }, { status: 201 });
	} catch (err: unknown) {
		return handleError(err);
	}
}