export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { verifyAdmin } from 'lib/adminAuth';
import Product from 'models/Product';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const auth = verifyAdmin(req);
  if ('error' in auth) return auth.error;

  const { productId } = await params;
  await dbConnect();
  const product = await Product.findByIdAndUpdate(
    productId,
    { approved: true },
    { new: true }
  );

  if (!product) {
    return NextResponse.json({ status: 'error', message: 'Product not found.' }, { status: 404 });
  }
  return NextResponse.json({ status: 'success', product });
}
