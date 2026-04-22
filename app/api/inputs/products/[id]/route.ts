import { dbConnect } from 'lib/mongoose.ts';
import InputProduct from 'models/InputProduct.ts';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    const product = await InputProduct.findById(id).lean();
    if (!product) return Response.json({ error: 'Product not found' }, { status: 404 });
    return Response.json({ product });
  } catch (err: any) {
    return Response.json({ error: err.message || 'Failed to fetch product' }, { status: 500 });
  }
}
