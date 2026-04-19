import { NextRequest, NextResponse } from "next/server";
import type { RouteContext } from "next";

// In-memory mock DB for demonstration (replace with real DB logic)
const orders: any[] = globalThis.orders || [];
globalThis.orders = orders;

export async function POST(
  req: NextRequest,
  context: RouteContext<{ orderId: string }>
) {
  const { orderId } = context.params;
  // Find and update the order status
  const idx = orders.findIndex((o) => o._id === orderId);
  if (idx === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  orders[idx].status = "cancelled";
  return NextResponse.json({ success: true, order: orders[idx] });
}
