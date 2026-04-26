import { dbConnect } from 'lib/mongoose.ts';
import InputProduct from 'models/InputProduct.ts';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    const product = await InputProduct.findById(id).lean();
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
    return Response.json({ product });
  } catch (err: unknown) {
    let message = 'Failed to fetch product';
    if (typeof err === 'object' && err !== null && 'message' in err) {
      // @ts-expect-error: err.message may exist on unknown error objects
      message = err.message;
    }
    return Response.json({ error: message }, { status: 500 });
  }
}
