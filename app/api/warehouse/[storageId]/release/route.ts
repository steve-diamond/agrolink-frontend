import { NextRequest, NextResponse } from "next/server";

// In-memory mock DB for demonstration (replace with real DB logic)
type StorageRecord = { _id: string; released?: boolean; [key: string]: unknown };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storage: StorageRecord[] = (globalThis as any).storage || [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).storage = storage;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ storageId: string }> }
) {
  const { storageId } = await context.params;
  // Find and update the storage record
  const idx = storage.findIndex((s) => s._id === storageId);
  if (idx === -1) {
    return NextResponse.json({ error: "Storage record not found" }, { status: 404 });
  }
  storage[idx].released = true;
  return NextResponse.json({ success: true, storage: storage[idx] });
}
