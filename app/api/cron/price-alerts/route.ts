export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';


export async function GET(_req: NextRequest) {
  return NextResponse.json({ error: 'Not implemented: Supabase logic removed. Refactor to use MongoDB.' }, { status: 501 });
}
