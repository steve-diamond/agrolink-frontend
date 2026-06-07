export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { status: "error", code: "not_implemented", message: "Farming tips API is not implemented in this Next.js route. Use backend /api/v1/advisory endpoints." },
    { status: 501 }
  );
}
