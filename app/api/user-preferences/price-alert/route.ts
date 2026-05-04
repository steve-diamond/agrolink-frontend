import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { dbConnect } from 'lib/mongoose';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const UserPreference = require('models/UserPreference');

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Some NextAuth configs do not include 'id' in session.user, fallback to email if needed
  const user = session.user as typeof session.user & { id?: string };
  const user_id = user.id || user.email;
  if (!user_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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
