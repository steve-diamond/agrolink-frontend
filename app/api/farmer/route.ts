export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAuth } from 'lib/auth';
import { apiRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import User from 'models/User';
import FarmerApplication from 'models/FarmerApplication';

export async function GET(req: NextRequest) {
	const rateLimitResponse = await apiRateLimit(req);
	if (rateLimitResponse) return rateLimitResponse;

	const auth = verifyAuth(req);
	if ('error' in auth) return auth.error;

	try {
		await dbConnect();

		const user = await User.findById(auth.payload.id)
			.select('name email phone role organizationName metadata approved status createdAt updatedAt')
			.lean();

		if (!user) {
			return NextResponse.json({ status: 'error', message: 'User not found.' }, { status: 404 });
		}

		const application = await FarmerApplication.findOne({ 'account.email': user.email })
			.sort({ createdAt: -1 })
			.lean();

		return NextResponse.json({
			status: 'success',
			data: {
				profile: user,
				application,
			},
		});
	} catch (err: unknown) {
		return handleError(err);
	}
}