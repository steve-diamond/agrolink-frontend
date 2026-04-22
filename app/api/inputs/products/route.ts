import { dbConnect } from 'lib/mongoose.ts';
import InputProduct from 'models/InputProduct.ts';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const state = searchParams.get('state');
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || 500000);
  const nafdac = searchParams.get('nafdac');
  const seller_id = searchParams.get('seller_id');

  const filter: any = { is_active: true };
  if (category) filter.category = category;
  if (state) filter.state = state;
  if (nafdac) filter.is_nafdac_approved = true;
  if (seller_id) filter.seller_id = seller_id;
  filter.price_per_unit = { $gte: minPrice, $lte: maxPrice };

  try {
    const products = await InputProduct.find(filter).sort({ created_at: -1 }).lean();
    return Response.json({ products });
  } catch (err: any) {
    return Response.json({ error: err.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  // Validate required fields
  const required = ['seller_id', 'name', 'category', 'price_per_unit', 'unit', 'quantity_available', 'state'];
  for (const field of required) {
    if (!body[field]) {
      return Response.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }
  try {
    const product = await InputProduct.create({
      seller_id: body.seller_id,
      name: body.name,
      brand: body.brand,
      category: body.category,
      description: body.description,
      price_per_unit: body.price_per_unit,
      unit: body.unit,
      quantity_available: body.quantity_available,
      state: body.state,
      delivery_available: body.delivery_available,
      image_url: body.image_url,
      is_nafdac_approved: body.is_nafdac_approved,
      nafdac_number: body.nafdac_number,
    });
    return Response.json({ product });
  } catch (err: any) {
    return Response.json({ error: err.message || 'Failed to create product' }, { status: 400 });
  }
}
