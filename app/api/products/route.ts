export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import Product from 'models/Product';
import { verifyAuth } from 'lib/auth';
import { handleError } from 'lib/errorHandler';
import { apiRateLimit, publicRateLimit } from 'lib/rateLimit';
import { Schemas, validateBody } from 'lib/validators';

export async function GET(req: NextRequest) {
  const rateLimitResponse = await publicRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const approvedParam = searchParams.get('approved');
    const farmer = searchParams.get('farmer');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const filter: Record<string, unknown> = { isActive: true };

    if (approvedParam !== null) {
      filter.approved = approvedParam === 'true';
    }
    if (farmer) filter.farmer = farmer;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice ? { $gte: Number(minPrice) } : {}),
        ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
      };
    }

    const products = await Product.find(filter)
      .populate('farmer', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ status: 'success', data: products });
  } catch (err: unknown) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = verifyAuth(req);
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const validated = validateBody(Schemas.createProduct, body);

    await dbConnect();

    const product = await Product.create({
      ...validated,
      farmer: auth.payload.id,
      approved: false,
    });

    return NextResponse.json(
      { status: 'success', data: product },
      { status: 201 }
    );
  } catch (err: unknown) {
    return handleError(err);
  }
}
