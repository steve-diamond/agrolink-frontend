export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { handleConversation } from 'lib/whatsapp/conversationEngine';
import { handleError, logError } from 'lib/errorHandler';
import { apiRateLimit } from 'lib/rateLimit';

// GET: Meta webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!verifyToken) {
    return new NextResponse('WhatsApp webhook not configured.', { status: 503 });
  }
  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// POST: Receive WhatsApp messages
export async function POST(req: NextRequest) {
  const rateLimitResponse = await apiRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
    const signature = req.headers.get('x-hub-signature-256');

    if (!webhookSecret) {
      logError('[WhatsApp webhook] WHATSAPP_WEBHOOK_SECRET not configured', new Error('Missing env var'));
      return new NextResponse('Webhook not configured.', { status: 503 });
    }

    const rawBody = await req.text();

    // Verify X-Hub-Signature-256 from Meta
    if (!signature) {
      logError('[WhatsApp webhook] Missing X-Hub-Signature-256 header', new Error('No signature'));
      return new NextResponse('Forbidden', { status: 403 });
    }

    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')}`;

    if (signature !== expectedSignature) {
      logError('[WhatsApp webhook] Signature mismatch', new Error('Invalid signature'));
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = JSON.parse(rawBody) as Record<string, unknown>;
    // Route to conversation handler (non-blocking — Meta expects 200 immediately)
    handleConversation(body).catch((err: unknown) =>
      logError('[WhatsApp handleConversation]', err as Error)
    );

    return new NextResponse('OK', { status: 200 });
  } catch (err: unknown) {
    return handleError(err);
  }
}
