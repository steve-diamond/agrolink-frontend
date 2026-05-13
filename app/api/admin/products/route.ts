export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAdmin } from 'lib/adminAuth';
import Product from 'models/Product';

export async function GET(req: NextRequest) {
  const auth = verifyAdmin(req);
  if ('error' in auth) return auth.error;

  await dbConnect();
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ products });
}
