export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { dbConnect } from 'lib/mongoose';
import User, { type UserRole } from 'models/User';

const ALLOWED_ROLES: UserRole[] = [
  'farmer', 'buyer', 'cooperative', 'logistics', 'warehouse', 'investor', 'admin',
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, password, phone, role,
      organizationName, metadata, inviteCode,
    } = body as {
      name: string;
      email: string;
      password: string;
      phone?: string;
      role?: string;
      organizationName?: string;
      metadata?: Record<string, unknown>;
      inviteCode?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const resolvedRole: UserRole = (ALLOWED_ROLES.includes(role as UserRole) ? role : 'buyer') as UserRole;

    // Admin registration requires a valid invite code
    if (resolvedRole === 'admin') {
      const adminCode = process.env.ADMIN_INVITE_CODE;
      if (!adminCode || inviteCode !== adminCode) {
        return NextResponse.json(
          { status: 'error', message: 'Invalid or missing admin invite code.' },
          { status: 403 }
        );
      }
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { status: 'error', message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Admin accounts are pre-approved; all others require admin review
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: resolvedRole,
      organizationName: organizationName || undefined,
      metadata: metadata || undefined,
      approved: resolvedRole === 'admin',
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { status: 'error', message: 'Server configuration error.' },
        { status: 500 }
      );
    }

    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      { expiresIn }
    );

    const userObj = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...safeUser } = userObj;

    return NextResponse.json(
      { status: 'success', data: { user: safeUser, token } },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('[/api/auth/register]', err);
    return NextResponse.json(
      { status: 'error', message: 'Unable to complete registration. Please try again.' },
      { status: 500 }
    );
  }
}
