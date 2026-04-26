import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const body = await request.json();

    // TODO: your update logic here

    return NextResponse.json({
      success: true,
      orderId,
      data: body,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to edit order" },
      { status: 500 }
    );
  }
}
