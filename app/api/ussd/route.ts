export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose';
import CommodityPrice from 'models/CommodityPrice';
import { sendListingConfirmedSMS } from 'lib/sms';
import { logError } from 'lib/errorHandler';
import { apiRateLimit } from 'lib/rateLimit';

function ussdResponse(message: string): NextResponse {
  return new NextResponse(message, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function POST(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.formData();
    const sessionId = body.get('sessionId') as string;
    const phoneNumber = body.get('phoneNumber') as string;
    const text = (body.get('text') as string) ?? '';
    const inputs = text.split('*');

    if (!phoneNumber || !sessionId) {
      return ussdResponse('END Invalid session. Please try again.');
    }

    await dbConnect();

    // Main Menu
    if (text === '' || text === '0') {
      return ussdResponse('CON Welcome to DosAgroLink\n1. Check Commodity Prices\n2. Post Produce for Sale\n3. Apply for Loan\n4. Check Loan Status\n5. Contact Support');
    }

    // Option 1: Check Commodity Prices
    if (inputs[0] === '1') {
      if (!inputs[1]) {
        return ussdResponse('CON Select Commodity:\n1. Maize\n2. Cassava\n3. Rice\n4. Poultry\n5. Fishery\n6. Vegetables\n7. Mixed');
      }
      if (!inputs[2]) {
        return ussdResponse('CON Select State:\n1. Lagos\n2. Kano\n3. Kaduna\n4. Ogun\n5. Oyo\n6. Benue\n7. Abia');
      }
      const commodities = ['Maize', 'Cassava', 'Rice', 'Poultry', 'Fishery', 'Vegetables', 'Mixed'];
      const states = ['Lagos', 'Kano', 'Kaduna', 'Ogun', 'Oyo', 'Benue', 'Abia'];
      const commodity = commodities[Number(inputs[1]) - 1] ?? 'Maize';
      const state = states[Number(inputs[2]) - 1] ?? 'Lagos';
      const price = await CommodityPrice.findOne({ commodity_name: commodity, state }).sort({ updated_at: -1 }).lean() as {
        price: number; price_per_kg?: number; trend?: string; price_change_pct?: number; updated_at: Date;
      } | null;
      if (!price) {
        return ussdResponse(`END No price data for ${commodity} in ${state}.`);
      }
      const arrow = price.trend === 'up' ? '↑' : price.trend === 'down' ? '↓' : '→';
      return ussdResponse(
        `END ${commodity} in ${state}: ₦${price.price_per_kg ?? price.price}/kg ${arrow}${price.price_change_pct ?? 0}% | Updated: ${new Date(price.updated_at).toLocaleString('en-NG', { hour: '2-digit', minute: '2-digit' })}`
      );
    }

    // Option 2: Post Produce for Sale
    if (inputs[0] === '2') {
      if (!inputs[1]) return ussdResponse('CON Enter quantity in KG:');
      if (!inputs[2]) return ussdResponse('CON Enter asking price per KG (₦):');
      if (!inputs[3]) {
        return ussdResponse(`CON Confirm Listing:\nQuantity: ${inputs[1]}kg\nPrice: ₦${inputs[2]}/kg\n1. Yes\n2. No`);
      }
      if (inputs[3] === '1') {
        await sendListingConfirmedSMS(phoneNumber, 'Produce', Number(inputs[1]), Number(inputs[2])).catch(
          (smsErr) => logError('[USSD listing SMS]', smsErr as Error, { phone: phoneNumber.slice(-4) })
        );
        return ussdResponse('END Listing submitted. You will receive an SMS confirmation shortly.');
      }
      return ussdResponse('END Listing cancelled.');
    }

    // Option 3–5
    if (inputs[0] === '3') {
      return ussdResponse('END For loan applications, visit dosagrolink.ng or contact your nearest DosAgroLink agent.');
    }




    if (inputs[0] === '4') {
      return ussdResponse('END Please login to your DosAgroLink dashboard at dosagrolink.ng or contact support.');
    }
    if (inputs[0] === '5') {
      return ussdResponse('END Call 0800-DOS-AGRO or email support@dosagrolink.com.ng');
    }

    return ussdResponse('END Invalid selection. Please dial again and choose a valid option.');
  } catch (err: unknown) {
    logError('[USSD route]', err as Error);
    return ussdResponse('END Service temporarily unavailable. Please try again.');
  }
}
