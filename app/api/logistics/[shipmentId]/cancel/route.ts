export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ shipmentId: string }> }
) {
  const { shipmentId } = await context.params;
  return NextResponse.json(
    {
      status: "error",
      code: "not_implemented",
      message: "Shipment cancel route is not implemented.",
      shipmentId,
    },
    { status: 501 }
  );
}
