export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server';


export async function GET() {
  return NextResponse.json({ error: 'Not implemented: Supabase logic removed. Refactor to use MongoDB.' }, { status: 501 });
}
