export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from 'lib/auth';
import crypto from 'crypto';
import { handleError } from 'lib/errorHandler';
import { apiRateLimit } from 'lib/rateLimit';
import { Schemas, validateBody } from 'lib/validators';
import { dbConnect } from 'lib/mongoose';
import Order from 'models/Order';

export async function POST(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const auth = verifyAuth(req);
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const { email, orderId, callback_url } = validateBody(Schemas.initializePayment, body);

    // Fetch order to get the amount
    await dbConnect();
    const order = await Order.findById(orderId).lean();
    if (!order) {
      return NextResponse.json({ status: 'error', message: 'Order not found.' }, { status: 404 });
    }

    if (String(order.user) !== String(auth.payload.id)) {
      return NextResponse.json({ status: 'error', message: 'You are not allowed to pay for this order.' }, { status: 403 });
    }

    if (String(order.paymentStatus || '').toLowerCase() === 'paid') {
      return NextResponse.json({ status: 'error', message: 'Order is already paid.' }, { status: 409 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json(
        { status: 'error', message: 'Payment service not configured.' },
        { status: 500 }
      );
    }

    const reference = `agrolink-${orderId}-${crypto.randomBytes(6).toString('hex')}`;

    // Amount in kobo (1 NGN = 100 kobo)
    const amountNgn = Number(order.totalAmount ?? 0);
    if (!Number.isFinite(amountNgn) || amountNgn <= 0) {
      return NextResponse.json({ status: 'error', message: 'Order amount is invalid.' }, { status: 400 });
    }

    const amountKobo = Math.round(amountNgn * 100);

    const payload: Record<string, unknown> = {
      email,
      amount: amountKobo,
      reference,
      metadata: { orderId },
    };
    if (callback_url) payload.callback_url = callback_url;

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!paystackRes.ok) {
      const errBody = await paystackRes.json().catch(() => ({}));
      const { logError } = await import('lib/errorHandler');
      logError('[POST /api/payment/initialize] Paystack error', new Error(JSON.stringify(errBody)));
      return NextResponse.json(
        { status: 'error', message: 'Failed to initialize payment.' },
        { status: 502 }
      );
    }

    const result = await paystackRes.json() as {
      status: boolean;
      data: { authorization_url: string; access_code: string; reference: string };
    };

    return NextResponse.json({ status: 'success', data: result });
  } catch (err: unknown) {
    return handleError(err);
  }
}
