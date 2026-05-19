export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import Order from 'models/Order';
import Product from 'models/Product';
import { verifyAuth } from 'lib/auth';

const COMMISSION_RATE = 0.05; // 5% platform commission

export async function GET(req: NextRequest) {
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
    console.error('[GET /api/orders]', err);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch orders.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const { products } = body as {
      products: Array<{ productId: string; quantity: number }>;
    };

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'At least one product is required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Validate products and compute total
    let subtotal = 0;
    for (const item of products) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { status: 'error', message: 'Each product must have a valid productId and quantity.' },
          { status: 400 }
        );
      }
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
    console.error('[POST /api/orders]', err);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create order.' },
      { status: 500 }
    );
  }
}
