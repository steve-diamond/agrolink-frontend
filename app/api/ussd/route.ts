import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose.ts';
import CommodityPrice from 'models/CommodityPrice.ts';
// import Listing from 'models/Listing.ts'; // Uncomment and implement if Listing model exists
import { sendListingConfirmedSMS } from 'lib/sms.ts';

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.formData();
  const sessionId = body.get('sessionId') as string;
  const phoneNumber = body.get('phoneNumber') as string;
  const text = (body.get('text') as string) || '';
  const inputs = text.split('*');

  // Main Menu
  if (text === '' || text === '0') {
    return NextResponse.text(
      'CON Welcome to DosAgroLink\n1. Check Commodity Prices\n2. Post Produce for Sale\n3. Apply for Loan\n4. Check Loan Status\n5. Contact Support'
    );
  }

  // Option 1: Check Commodity Prices
  if (inputs[0] === '1') {
    // Step 1: Select commodity
    if (!inputs[1]) {
      return NextResponse.text(
        'CON Select Commodity:\n1. Maize\n2. Cassava\n3. Rice\n4. Poultry\n5. Fishery\n6. Vegetables\n7. Mixed'
      );
    }
    // Step 2: Select state
    if (!inputs[2]) {
      return NextResponse.text(
        'CON Select State:\n1. Lagos\n2. Kano\n3. Kaduna\n4. Ogun\n5. Oyo\n6. Benue\n7. Abia'
      );
    }
    // Step 3: Show price
    const commodities = ['Maize','Cassava','Rice','Poultry','Fishery','Vegetables','Mixed'];
    const states = ['Lagos','Kano','Kaduna','Ogun','Oyo','Benue','Abia'];
    const commodity = commodities[Number(inputs[1])-1] || 'Maize';
    const state = states[Number(inputs[2])-1] || 'Lagos';
    // Fetch latest price
    const price = await CommodityPrice.findOne({ commodity_name: commodity, state }).sort({ updated_at: -1 }).lean();
    if (!price) {
      return NextResponse.text(`END No price data for ${commodity} in ${state}.`);
    }
    const arrow = price.trend === 'up' ? '↑' : price.trend === 'down' ? '↓' : '→';
    return NextResponse.text(
      `END ${commodity} in ${state}: ₦${price.price_per_kg}/kg ${arrow}${price.price_change_pct || 0}% | Updated: ${new Date(price.updated_at).toLocaleString('en-NG', { hour: '2-digit', minute: '2-digit' })} | Reply 0 for Main Menu`
    );
  }

  // Option 2: Post Produce for Sale
  if (inputs[0] === '2') {
    // Step 1: Enter quantity
    if (!inputs[1]) {
      return NextResponse.text('CON Enter quantity in KG:');
    }
    // Step 2: Enter price
    if (!inputs[2]) {
      return NextResponse.text('CON Enter asking price per KG:');
    }
    // Step 3: Confirm
    if (!inputs[3]) {
      return NextResponse.text(`CON Confirm Listing:\nQuantity: ${inputs[1]}kg\nPrice: ₦${inputs[2]}/kg\n1. Yes\n2. No`);
    }
    if (inputs[3] === '1') {
      // Create draft listing
      // Uncomment and implement if Listing model exists
      // await Listing.create({
      //   phone: phoneNumber,
      //   quantity: Number(inputs[1]),
      //   price_per_kg: Number(inputs[2]),
      //   source: 'ussd_draft',
      //   status: 'draft',
      // });
      await sendListingConfirmedSMS(phoneNumber, 'Produce', Number(inputs[1]), Number(inputs[2]));
      return NextResponse.text('END Listing created. Confirmation SMS sent.');
    }
    return NextResponse.text('END Listing cancelled.');
  }

  // Option 3: Apply for Loan
  if (inputs[0] === '3') {
    return NextResponse.text('END Applications require smartphone. Visit nearest DosAgroLink agent or call 0800-DOS-AGRO for assistance.');
  }

  // Option 4: Check Loan Status
  if (inputs[0] === '4') {
    return NextResponse.text('END Please login to your DosAgroLink dashboard or contact support.');
  }

  // Option 5: Contact Support
  if (inputs[0] === '5') {
    return NextResponse.text('END Call 0800-DOS-AGRO or email support@dosagrolink.com.ng');
  }

  // Fallback
  return NextResponse.text('END Invalid selection. Reply 0 for Main Menu.');
}
