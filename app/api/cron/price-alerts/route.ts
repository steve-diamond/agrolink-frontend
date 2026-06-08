export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import { handleError } from 'lib/errorHandler';
import UserPreference from 'models/UserPreference';
import User from 'models/User';
import CommodityPrice from 'models/CommodityPrice';
import { sendPriceAlertSMS } from 'lib/sms';


export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization') ?? '';
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    await dbConnect();

    const preferences = await UserPreference.find({ alert_enabled: true }).lean();
    let sent = 0;
    let skipped = 0;

    for (const pref of preferences) {
      const latest = await CommodityPrice.findOne({
        commodity_name: pref.commodity,
        state: pref.state,
      })
        .sort({ updated_at: -1 })
        .lean();

      const latestPriceDoc = latest as
        | { price?: number; price_change_pct?: number }
        | null;

      if (!latestPriceDoc || typeof latestPriceDoc.price !== 'number') {
        skipped += 1;
        continue;
      }

      const threshold = typeof pref.alert_threshold_pct === 'number' ? pref.alert_threshold_pct : 5;
      const changePct = Number(latestPriceDoc.price_change_pct ?? 0);
      if (Math.abs(changePct) < threshold) {
        skipped += 1;
        continue;
      }

      const user = await User.findById(pref.user_id).select('phone').lean();
      const phone = user?.phone;
      if (!phone) {
        skipped += 1;
        continue;
      }

      await sendPriceAlertSMS(phone, pref.commodity ?? 'Commodity', Number(latestPriceDoc.price), changePct);
      sent += 1;
    }

    return NextResponse.json({ status: 'success', data: { processed: preferences.length, sent, skipped } });
  } catch (err: unknown) {
    return handleError(err);
  }
}
