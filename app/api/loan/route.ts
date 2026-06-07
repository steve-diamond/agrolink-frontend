export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json(
		{ status: "error", code: "not_implemented", message: "Loan API is not implemented in this Next.js route. Use backend /api/v1/loans endpoints." },
		{ status: 501 }
	);
}

export async function POST() {
	return NextResponse.json(
		{ status: "error", code: "not_implemented", message: "Loan repayment API is not implemented in this Next.js route. Use backend /api/v1/loans/:id/repay endpoint." },
		{ status: 501 }
	);
}