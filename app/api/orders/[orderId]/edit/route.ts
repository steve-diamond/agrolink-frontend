import { NextRequest, NextResponse } from "next/server";

// In-memory mock DB for demonstration (replace with real DB logic)
const orders: any[] = globalThis.orders || [];
globalThis.orders = orders;

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params;
    const body = await req.json();

    // your update logic here

    return NextResponse.json({
      success: true,
      orderId,
      data: body,
    });

  } catch {
    return NextResponse.json(
      { error: "Failed to edit order" },
      { status: 500 }
    );
  }
}
