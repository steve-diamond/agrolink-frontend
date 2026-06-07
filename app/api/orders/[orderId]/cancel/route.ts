export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await context.params;
  return NextResponse.json(
    {
      status: "error",
      code: "not_implemented",
      message: "Order cancel route is not implemented.",
      orderId,
    },
    { status: 501 }
  );
}
