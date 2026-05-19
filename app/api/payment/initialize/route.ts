export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from 'lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const { email, amount, orderId, callback_url } = body as {
      email: string;
      amount: number;
      orderId: string;
      callback_url?: string;
    };

    if (!email || !amount || !orderId) {
      return NextResponse.json(
        { status: 'error', message: 'email, amount, and orderId are required.' },
        { status: 400 }
      );
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json(
        { status: 'error', message: 'Payment service not configured.' },
        { status: 500 }
      );
    }

    const reference = `agrolink-${orderId}-${crypto.randomBytes(6).toString('hex')}`;

    // Amount must be in kobo (multiply NGN by 100)
    const amountKobo = Math.round(Number(amount) * 100);

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
      console.error('[POST /api/payment/initialize] Paystack error:', errBody);
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
    console.error('[POST /api/payment/initialize]', err);
    return NextResponse.json(
      { status: 'error', message: 'Payment initialization failed.' },
      { status: 500 }
    );
  }
}
