export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json(
		{ status: "error", code: "not_implemented", message: "Analytics route is not implemented." },
		{ status: 501 }
	);
}