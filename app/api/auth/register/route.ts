export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { dbConnect } from 'lib/mongoose';
import User from 'models/User';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json(
        { status: 'error', message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: role || 'buyer',
      approved: false,
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
    const message = err instanceof Error ? err.message : 'Registration failed';
    return NextResponse.json(
      { status: 'error', message },
      { status: 500 }
    );
  }
}
