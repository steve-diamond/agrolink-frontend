export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAdmin } from 'lib/adminAuth';
import Order from 'models/Order';

const ALLOWED_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = verifyAdmin(req);
  if ('error' in auth) return auth.error;

  const { orderId } = await params;
  const { status } = await req.json();

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ status: 'error', message: 'Invalid status.' }, { status: 400 });
  }

  await dbConnect();

  const order = await Order.findById(orderId);
  if (!order) {
    return NextResponse.json({ status: 'error', message: 'Order not found.' }, { status: 404 });
  }

  order.status = status;
  await order.save();

  return NextResponse.json({ status: 'success', order });
}
