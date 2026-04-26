import { NextRequest, NextResponse } from "next/server";

// In-memory mock DB for demonstration (replace with real DB logic)
type StorageRecord = { _id: string; released?: boolean; [key: string]: unknown };
declare global {
  var storage: StorageRecord[];
}
const storage: StorageRecord[] = globalThis.storage || [];
globalThis.storage = storage;

export async function POST(req: NextRequest, context: { params?: { storageId?: string } }) {
  const { storageId } = context?.params || {};
  // Find and update the storage record
  const idx = storage.findIndex((s) => s._id === storageId);
  if (idx === -1) {
    return NextResponse.json({ error: "Storage record not found" }, { status: 404 });
  }
  storage[idx].released = true;
  return NextResponse.json({ success: true, storage: storage[idx] });
}
