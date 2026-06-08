export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAuth } from 'lib/auth';
import { apiRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import Product from 'models/Product';
import Order from 'models/Order';
import User from 'models/User';

export async function GET(req: NextRequest) {
	const rateLimitResponse = await apiRateLimit(req);
	if (rateLimitResponse) return rateLimitResponse;

	const auth = verifyAuth(req);
	if ('error' in auth) return auth.error;

	try {
		await dbConnect();

		const baseOrderFilter: Record<string, unknown> = {};
		const baseProductFilter: Record<string, unknown> = {};

		if (auth.payload.role !== 'admin') {
			baseOrderFilter.user = auth.payload.id;
			baseProductFilter.seller = auth.payload.id;
		}

		const [
			totalOrders,
			paidOrders,
			deliveredOrders,
			totalProducts,
			activeProducts,
			totalUsers,
		] = await Promise.all([
			Order.countDocuments(baseOrderFilter),
			Order.countDocuments({ ...baseOrderFilter, paymentStatus: 'paid' }),
			Order.countDocuments({ ...baseOrderFilter, status: 'delivered' }),
			Product.countDocuments(baseProductFilter),
			Product.countDocuments({ ...baseProductFilter, isActive: true }),
			auth.payload.role === 'admin' ? User.countDocuments({}) : Promise.resolve(undefined),
		]);

		return NextResponse.json({
			status: 'success',
			data: {
				totalOrders,
				paidOrders,
				deliveredOrders,
				totalProducts,
				activeProducts,
				totalUsers,
			},
		});
	} catch (err: unknown) {
		return handleError(err);
	}
}