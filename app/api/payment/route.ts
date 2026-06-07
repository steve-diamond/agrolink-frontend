export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json(
		{ status: "error", code: "not_implemented", message: "Payment route is not implemented. Use specific payment endpoints." },
		{ status: 501 }
	);
}