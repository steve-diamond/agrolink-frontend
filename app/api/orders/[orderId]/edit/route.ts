import { NextRequest, NextResponse } from "next/server";

// In-memory mock DB for demonstration (replace with real DB logic)
const orders: any[] = globalThis.orders || [];
globalThis.orders = orders;

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const body = await req.json();
  const idx = orders.findIndex((o) => o._id === orderId);
  if (idx === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  // Only allow editing quantity and buyerId
  if (typeof body.quantity === "number") orders[idx].quantity = body.quantity;
  if (body.buyerId && typeof body.buyerId.name === "string") orders[idx].buyerId.name = body.buyerId.name;
  if (body.buyerId && typeof body.buyerId.email === "string") orders[idx].buyerId.email = body.buyerId.email;
  return NextResponse.json({ success: true, order: orders[idx] });
}
