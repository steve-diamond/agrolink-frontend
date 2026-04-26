import { NextRequest, NextResponse } from "next/server";

// In-memory mock DB for demonstration (replace with real DB logic)
type Shipment = { _id: string; status?: string; [key: string]: unknown };
declare global {
  var shipments: Shipment[];
}
const shipments: Shipment[] = globalThis.shipments || [];
globalThis.shipments = shipments;

export async function POST(req: NextRequest, context: { params?: { shipmentId?: string } }) {
  const { shipmentId } = context?.params || {};
  // Find and update the shipment status
  const idx = shipments.findIndex((s) => s._id === shipmentId);
  if (idx === -1) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }
  shipments[idx].status = "cancelled";
  return NextResponse.json({ success: true, shipment: shipments[idx] });
}
