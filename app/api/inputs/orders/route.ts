export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from 'lib/mongoose';
import { verifyAuth } from 'lib/auth';
import { apiRateLimit } from 'lib/rateLimit';
import { handleError } from 'lib/errorHandler';
import { validateBody } from 'lib/validators';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const InputOrder = require('models/InputOrder');
import InputProduct from 'models/InputProduct';

const createInputOrderSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  delivery_address: z.string().min(5).max(500),
});

export async function GET(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = verifyAuth(req);
  if ('error' in auth) return auth.error;

  try {
    await dbConnect();
    const orders = await InputOrder.find({ buyer_id: auth.payload.id })
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ status: 'success', data: { orders } });
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
    const payload = validateBody(createInputOrderSchema, body);

    await dbConnect();
    const product = await InputProduct.findById(payload.product_id).lean();

    if (!product || product.is_active !== true) {
      return NextResponse.json({ status: 'error', message: 'Input product is not available.' }, { status: 404 });
    }

    const available = Number(product.quantity_available || 0);
    if (payload.quantity > available) {
      return NextResponse.json({ status: 'error', message: 'Requested quantity exceeds available stock.' }, { status: 400 });
    }

    const unitPrice = Number(product.price_per_unit || 0);
    const total_price = unitPrice * payload.quantity;

    const order = await InputOrder.create({
      buyer_id: auth.payload.id,
      product_id: payload.product_id,
      quantity: payload.quantity,
      total_price,
      delivery_address: payload.delivery_address,
      payment_status: 'pending',
      order_status: 'pending',
    });

    await InputProduct.findByIdAndUpdate(payload.product_id, {
      $inc: { quantity_available: -payload.quantity },
    });

    return NextResponse.json({ status: 'success', data: { order } }, { status: 201 });
  } catch (err: unknown) {
    return handleError(err);
  }
}
