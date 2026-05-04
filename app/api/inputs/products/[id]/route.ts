import { dbConnect } from 'lib/mongoose';
import InputProduct from 'models/InputProduct';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await context.params;
  try {
    const product = await InputProduct.findById(id).lean();
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err: unknown) {
    let message = 'Failed to fetch product';
    if (typeof err === 'object' && err !== null && 'message' in err) {
      // @ts-expect-error: err.message may exist on unknown error objects
      message = err.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
