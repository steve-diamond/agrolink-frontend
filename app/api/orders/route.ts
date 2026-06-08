export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import Order from 'models/Order';
import Product from 'models/Product';
import { verifyAuth } from 'lib/auth';
import { handleError } from 'lib/errorHandler';
import { apiRateLimit } from 'lib/rateLimit';
import { Schemas, validateBody } from 'lib/validators';

const COMMISSION_RATE = 0.05; // 5% platform commission

export async function GET(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = verifyAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();

    const orders = await Order.find({ user: auth.payload.id })
      .populate('products.productId', 'name price imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ status: 'success', data: orders });
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
    const { products } = validateBody(Schemas.createOrder, body);

    await dbConnect();

    let subtotal = 0;
    for (const item of products) {
      const product = await Product.findById(item.productId).lean();
      if (!product) {
        return NextResponse.json(
          { status: 'error', message: `Product ${item.productId} not found.` },
          { status: 404 }
        );
      }
      if (product.quantity < item.quantity) {
        return NextResponse.json(
          { status: 'error', message: `Insufficient stock for product: ${product.name}.` },
          { status: 400 }
        );
      }
      subtotal += product.price * item.quantity;
    }

    const commission = Math.round(subtotal * COMMISSION_RATE * 100) / 100;
    const totalAmount = subtotal;

    const order = await Order.create({
      user: auth.payload.id,
      products: products.map((p) => ({ productId: p.productId, quantity: p.quantity })),
      totalAmount,
      commission,
    });

    return NextResponse.json(
      { status: 'success', data: order },
      { status: 201 }
    );
  } catch (err: unknown) {
    return handleError(err);
  }
}
