import { NextRequest, NextResponse } from "next/server";

// In-memory mock DB for demonstration (replace with real DB logic)
type Order = { _id: string; status?: string; [key: string]: unknown };
declare global {
  var orders: Order[];
}
const orders: Order[] = globalThis.orders || [];
globalThis.orders = orders;

export async function POST(req: NextRequest, context: { params?: { orderId?: string } }) {
  const { orderId } = context?.params || {};
  // Find and update the order status
  const idx = orders.findIndex((o) => o._id === orderId);
  if (idx === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  orders[idx].status = "cancelled";
  return NextResponse.json({ success: true, order: orders[idx] });
}
