export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json(
		{ status: "error", code: "not_implemented", message: "Logistics API is not implemented in this Next.js route. Use backend /api/v1/logistics endpoints." },
		{ status: 501 }
	);
}