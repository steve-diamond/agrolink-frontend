export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { dbConnect } from 'lib/mongoose';
import User from 'models/User';

interface GoogleTokenInfo {
  iss: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: string;
  name?: string;
  picture?: string;
  exp: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { credential?: string; role?: string };
    const { credential, role } = body;

    if (!credential) {
      return NextResponse.json(
        { status: 'error', message: 'Google credential is required.' },
        { status: 400 }
      );
    }

    /* ---- Verify credential with Google's tokeninfo endpoint ---- */
    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!googleRes.ok) {
      return NextResponse.json(
        { status: 'error', message: 'Google token verification failed. Please try again.' },
        { status: 401 }
      );
    }

    const info = await googleRes.json() as GoogleTokenInfo;

    /* ---- Validate audience ---- */
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && info.aud !== clientId) {
      return NextResponse.json(
        { status: 'error', message: 'Token audience mismatch.' },
        { status: 401 }
      );
    }

    /* ---- Check expiry ---- */
    if (Number(info.exp) * 1000 < Date.now()) {
      return NextResponse.json(
        { status: 'error', message: 'Google session has expired. Please sign in again.' },
        { status: 401 }
      );
    }

    if (!info.email) {
      return NextResponse.json(
        { status: 'error', message: 'Could not retrieve email from Google account.' },
        { status: 400 }
      );
    }

    /* ---- Find or create user ---- */
    await dbConnect();

    let user = await User.findOne({ email: info.email.toLowerCase() });

    if (!user) {
      // Build a non-guessable generated password for the required field
      const { randomBytes } = await import('crypto');
      const generatedPassword = `GAUTH_${randomBytes(24).toString('hex')}`;

      user = await User.create({
        name: info.name ?? info.email.split('@')[0],
        email: info.email.toLowerCase(),
        password: generatedPassword,
        phone: '',
        role: role || 'buyer',
        approved: true, // Google-verified accounts are pre-approved
      });
    }

    /* ---- Issue our JWT ---- */
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { status: 'error', message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
    const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn });

    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...safeUser } = userObj;

    const response = NextResponse.json({ status: 'success', data: { user: safeUser, token } });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  } catch (err: unknown) {
    console.error('[/api/auth/oauth/google]', err);
    return NextResponse.json(
      { status: 'error', message: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
