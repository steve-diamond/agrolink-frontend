import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose.ts';
import CommodityPrice from 'models/CommodityPrice.ts';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state');
  const commodity = searchParams.get('commodity');

  const filter: any = {};
  if (state) filter.state = state;
  if (commodity) filter.commodity_name = new RegExp(commodity, 'i');

  try {
    const docs = await CommodityPrice.find(filter).sort({ updated_at: -1 }).lean();
    // Group by commodity_name and state, pick latest
    const grouped: Record<string, any> = {};
    let last_updated = null;
    for (const row of docs) {
      const key = `${row.commodity_name}__${row.state}`;
      if (!grouped[key]) {
        grouped[key] = row;
        if (!last_updated || row.updated_at > last_updated) last_updated = row.updated_at;
      }
    }
    return NextResponse.json({ prices: Object.values(grouped), last_updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch prices' }, { status: 500 });
  }
}
