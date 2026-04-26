import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from 'lib/mongoose.ts';
import InsuranceApplication from 'models/InsuranceApplication.ts';
import { sendSMS } from 'lib/sms.ts';

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  // Calculate premium and coverage based on plan
  let premium_amount = 5000, coverage_amount = 150000;
  if (data.plan === 'standard') {
    premium_amount = 12000;
    coverage_amount = 400000;
  } else if (data.plan === 'premium') {
    premium_amount = 25000;
    coverage_amount = 1000000;
  }
  try {
    await InsuranceApplication.create({
      ...data,
      premium_amount,
      coverage_amount,
      status: 'pending',
    });
    await sendSMS(data.phone, `Your DosAgrolink insurance application was received. We will contact you after review.`);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    let message = 'Failed to apply for insurance';
    if (typeof err === 'object' && err !== null && 'message' in err) {
      // @ts-expect-error: err.message may exist on unknown error objects
      message = err.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
