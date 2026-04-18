import { NextRequest, NextResponse } from "next/server";

// In-memory mock DB for demonstration (replace with real DB logic)
let shipments: any[] = globalThis.shipments || [];
globalThis.shipments = shipments;

export async function POST(req: NextRequest, { params }: { params: { shipmentId: string } }) {
  const { shipmentId } = params;
  // Find and update the shipment status
  const idx = shipments.findIndex((s) => s._id === shipmentId);
  if (idx === -1) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }
  shipments[idx].status = "cancelled";
  return NextResponse.json({ success: true, shipment: shipments[idx] });
}
