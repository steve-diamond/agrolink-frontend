export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';


export async function POST(_req: NextRequest) {
  return NextResponse.json({ error: 'Not implemented: Supabase/email logic removed. Refactor to use MongoDB.' }, { status: 501 });
}
