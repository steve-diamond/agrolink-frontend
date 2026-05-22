import { NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, string> = {
    mongodb_uri: process.env.MONGODB_URI ? 'set' : 'MISSING',
    jwt_secret: process.env.JWT_SECRET ? 'set' : 'MISSING',
    node_env: process.env.NODE_ENV ?? 'undefined',
  };

  let dbStatus = 'not_checked';
  if (process.env.MONGODB_URI) {
    try {
      await dbConnect();
      dbStatus = 'connected';
    } catch (err: unknown) {
      dbStatus = err instanceof Error ? `error: ${err.message.slice(0, 120)}` : 'error';
    }
  } else {
    dbStatus = 'skipped (MONGODB_URI missing)';
  }

  const ok = checks.mongodb_uri === 'set' && checks.jwt_secret === 'set' && dbStatus === 'connected';

  return NextResponse.json(
    { ok, checks: { ...checks, database: dbStatus } },
    { status: ok ? 200 : 503 }
  );
}
