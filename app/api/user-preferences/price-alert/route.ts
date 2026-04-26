import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from 'lib/mongoose.ts';
import UserPreference from 'models/UserPreference.ts';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user_id = session.user.id;
  const { commodity, state, alert_enabled, alert_threshold_pct } = await req.json();
  await dbConnect();
  try {
    await UserPreference.findOneAndUpdate(
      { user_id, commodity, state },
      { user_id, commodity, state, alert_enabled, alert_threshold_pct },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    let message = 'Failed to save preference';
    if (typeof err === 'object' && err !== null && 'message' in err) {
      // @ts-expect-error: err.message may exist on unknown error objects
      message = err.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
