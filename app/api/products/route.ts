export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import Product from 'models/Product';
import { verifyAuth } from 'lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const approvedParam = searchParams.get('approved');
    const farmer = searchParams.get('farmer');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const filter: Record<string, unknown> = { isActive: true };

    if (approvedParam !== null) {
      filter.approved = approvedParam === 'true';
    }
    if (farmer) filter.farmer = farmer;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice ? { $gte: Number(minPrice) } : {}),
        ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
      };
    }

    const products = await Product.find(filter)
      .populate('farmer', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ status: 'success', data: products });
  } catch (err: unknown) {
    console.error('[GET /api/products]', err);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch products.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if ('error' in auth) return auth.error;

  try {
    const body = await req.json();
    const { name, price, quantity, category, location, description, imageUrl } = body as {
      name: string;
      price: number;
      quantity: number;
      category?: string;
      location: string;
      description?: string;
      imageUrl?: string;
    };

    if (!name || price == null || quantity == null || !location) {
      return NextResponse.json(
        { status: 'error', message: 'Name, price, quantity, and location are required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.create({
      name,
      price: Number(price),
      quantity: Number(quantity),
      category: category || '',
      location,
      description: description || '',
      imageUrl: imageUrl || '',
      farmer: auth.payload.id,
      approved: false,
    });

    return NextResponse.json(
      { status: 'success', data: product },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('[POST /api/products]', err);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create product.' },
      { status: 500 }
    );
  }
}
