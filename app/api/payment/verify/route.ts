export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbConnect } from 'lib/mongoose';
import Order from 'models/Order';
import { handleError, logError } from 'lib/errorHandler';
import { apiRateLimit } from 'lib/rateLimit';
import { Schemas, validateBody } from 'lib/validators';

export async function POST(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { reference } = validateBody(Schemas.verifyPayment, body);

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ status: 'error', message: 'Payment service not configured.' }, { status: 500 });
    }

    // Verify transaction with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });

    if (!verifyRes.ok) {
      const errBody = await verifyRes.json().catch(() => ({}));
      logError('[GET /api/payment/verify] Paystack verify error', new Error(JSON.stringify(errBody)));
      return NextResponse.json({ status: 'error', message: 'Unable to verify payment.' }, { status: 502 });
    }

    const result = await verifyRes.json() as {
      status: boolean;
      data: {
        status: string;
        amount: number;
        reference: string;
        metadata?: { orderId?: string };
      };
    };

    if (!result.data || result.data.status !== 'success') {
      return NextResponse.json(
        { status: 'error', message: 'Payment was not successful.', paymentStatus: result.data?.status },
        { status: 400 }
      );
    }

    const { amount, reference: paystackRef, metadata } = result.data;
    const orderId = metadata?.orderId;

    if (!orderId) {
      logError('[GET /api/payment/verify] No orderId in metadata', new Error(paystackRef));
      return NextResponse.json({ status: 'error', message: 'Order reference missing from payment.' }, { status: 400 });
    }

    await dbConnect();

    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentReference: paystackRef,
      },
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json({ status: 'error', message: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Payment verified successfully.',
      data: {
        reference: paystackRef,
        amountNgn: amount / 100,
        orderId,
        orderStatus: 'confirmed',
      },
    });
  } catch (err: unknown) {
    return handleError(err);
  }
}

/**
 * Paystack webhook handler — receives payment events server-side.
 * Endpoint must be registered in your Paystack dashboard.
 */
export async function PATCH(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json({ status: 'error', message: 'Webhook not configured.' }, { status: 500 });
    }

    const signature = req.headers.get('x-paystack-signature');
    if (!signature) {
      return NextResponse.json({ status: 'error', message: 'Missing signature.' }, { status: 400 });
    }

    const rawBody = await req.text();

    // Verify HMAC-SHA512 signature
    const expectedSignature = crypto
      .createHmac('sha512', paystackSecret)
      .update(rawBody)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const validSignature =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!validSignature) {
      logError('[Paystack webhook] Invalid signature', new Error('Signature mismatch'));
      return NextResponse.json({ status: 'error', message: 'Invalid signature.' }, { status: 401 });
    }

    let event: {
      event: string;
      data: {
        status: string;
        reference: string;
        amount: number;
        metadata?: { orderId?: string };
      };
    };

    try {
      event = JSON.parse(rawBody) as {
        event: string;
        data: {
          status: string;
          reference: string;
          amount: number;
          metadata?: { orderId?: string };
        };
      };
    } catch {
      return NextResponse.json({ status: 'error', message: 'Invalid webhook payload.' }, { status: 400 });
    }

    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      const orderId = metadata?.orderId;

      if (orderId) {
        await dbConnect();
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentReference: reference,
        });
      }
    }

    return NextResponse.json({ status: 'success' });
  } catch (err: unknown) {
    return handleError(err);
  }
}
