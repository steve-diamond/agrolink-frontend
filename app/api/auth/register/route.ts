export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { dbConnect } from 'lib/mongoose';
import User, { type UserRole } from 'models/User';
import { handleError } from 'lib/errorHandler';
import { authRateLimit } from 'lib/rateLimit';
import { Schemas, validateBody } from 'lib/validators';

export async function POST(req: NextRequest) {
  const rateLimitResponse = await authRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const validated = validateBody(Schemas.register, body);
    const { name, email, password, phone, organizationName, inviteCode } = validated;
    const resolvedRole: UserRole = validated.role as UserRole;

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
    return handleError(err);
  }
}
