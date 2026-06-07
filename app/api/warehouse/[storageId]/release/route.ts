export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ storageId: string }> }
) {
  const { storageId } = await context.params;
  return NextResponse.json(
    {
      status: "error",
      code: "not_implemented",
      message: "Warehouse release route is not implemented.",
      storageId,
    },
    { status: 501 }
  );
}
