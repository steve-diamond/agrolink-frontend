export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Order from 'models/Order';
import { dbConnect } from 'lib/mongoose';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;

  if (!reference) {
    return NextResponse.json(
      { status: 'error', message: 'Payment reference is required.' },
      { status: 400 }
    );
  }

  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      return NextResponse.json(
        { status: 'error', message: 'Payment service not configured.' },
        { status: 500 }
      );
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${paystackSecret}` },
      }
    );

    if (!paystackRes.ok) {
      return NextResponse.json(
        { status: 'error', message: 'Failed to verify payment.' },
        { status: 502 }
      );
    }

    const result = await paystackRes.json() as {
      status: boolean;
      data: {
        status: string;
        reference: string;
        metadata?: { orderId?: string };
      };
    };

    const txStatus = result.data?.status;

    if (txStatus === 'success') {
      // Update order payment status
      const orderId = result.data?.metadata?.orderId;
      if (orderId) {
        await dbConnect();
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          paymentReference: reference,
          status: 'paid',
        });
      }

      return NextResponse.json({
        status: 'success',
        data: { status: 'success', reference },
      });
    }

    return NextResponse.json({
      status: 'success',
      data: { status: txStatus, reference },
    });
  } catch (err: unknown) {
    console.error('[GET /api/payment/verify]', err);
    return NextResponse.json(
      { status: 'error', message: 'Payment verification failed.' },
      { status: 500 }
    );
  }
}
