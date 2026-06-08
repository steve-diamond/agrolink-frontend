import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  code?: string;
}

export function handleError(error: unknown): NextResponse<ApiErrorResponse> {
  // Zod validation failures
  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: error.flatten() },
      { status: 400 }
    );
  }

  // Mongoose validation errors
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((e) => e.message).join('; ');
    return NextResponse.json(
      { success: false, error: `Database validation failed: ${messages}` },
      { status: 400 }
    );
  }

  // MongoDB duplicate key
  if (
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === '11000'
  ) {
    return NextResponse.json(
      { success: false, error: 'Duplicate entry — this record already exists.', code: 'DUPLICATE' },
      { status: 409 }
    );
  }

  // Cast errors (e.g. invalid ObjectId)
  if (error instanceof mongoose.Error.CastError) {
    return NextResponse.json(
      { success: false, error: 'Invalid identifier format.', code: 'INVALID_ID' },
      { status: 400 }
    );
  }

  // JWT errors (don't leak details)
  if (error instanceof Error && (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token.', code: 'AUTH_INVALID' },
      { status: 401 }
    );
  }

  // DB connection errors — hide infrastructure details
  if (error instanceof Error && (error.message.includes('ECONNREFUSED') || error.message.includes('ETIMEDOUT') || error.message.includes('MONGODB'))) {
    logError('[DosAgrolink DB Error]', error);
    return NextResponse.json(
      { success: false, error: 'Service temporarily unavailable. Please try again shortly.' },
      { status: 503 }
    );
  }

  // Unexpected errors — log server-side but don't expose internals
  logError('[DosAgrolink Error]', error);
  return NextResponse.json(
    { success: false, error: 'An unexpected error occurred. Please try again.' },
    { status: 500 }
  );
}

/**
 * Structured server-side logger. Replaces raw console.error calls.
 * In production, replace with Sentry, Datadog, or similar.
 */
export function logError(context: string, error: unknown, extra?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ timestamp, context, message, stack, ...extra }));
}

export function logInfo(context: string, message: string, extra?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'production') return;
  const timestamp = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ timestamp, context, message, ...extra }));
}
