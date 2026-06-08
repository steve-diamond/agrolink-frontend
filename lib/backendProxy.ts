import { NextRequest, NextResponse } from 'next/server';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
]);

function resolveBackendBaseUrl(): string {
  const base =
    process.env.INTERNAL_API_URL ??
    process.env.BACKEND_API_URL ??
    process.env.NEXT_PUBLIC_API_URL;

  if (!base) {
    throw new Error('Backend API base URL is not configured. Set INTERNAL_API_URL, BACKEND_API_URL, or NEXT_PUBLIC_API_URL.');
  }

  return base.endsWith('/') ? base : `${base}/`;
}

function buildProxyHeaders(req: NextRequest, hasBody: boolean, forceJsonBody: boolean): Headers {
  const headers = new Headers();

  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower)) return;
    if (lower.startsWith('x-forwarded-')) return;
    headers.set(key, value);
  });

  if (forceJsonBody) {
    headers.set('Content-Type', 'application/json');
  } else if (!hasBody) {
    headers.delete('Content-Type');
  }

  return headers;
}

export async function proxyToBackend(
  req: NextRequest,
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    jsonBody?: unknown;
    includeQuery?: boolean;
  }
): Promise<NextResponse> {
  const base = resolveBackendBaseUrl();
  const target = new URL(endpoint.replace(/^\//, ''), base);
  const method = options?.method ?? (req.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE');
  const includeQuery = options?.includeQuery ?? true;

  if (includeQuery) {
    req.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));
  }

  const hasBody = method !== 'GET' && method !== 'HEAD';
  const forceJsonBody = options?.jsonBody !== undefined;
  const headers = buildProxyHeaders(req, hasBody, forceJsonBody);

  let body: string | undefined;
  if (forceJsonBody) {
    body = JSON.stringify(options?.jsonBody);
  } else if (hasBody) {
    const raw = await req.text();
    body = raw.length > 0 ? raw : undefined;
  }

  const response = await fetch(target.toString(), {
    method,
    headers,
    body,
    cache: 'no-store',
  });

  const responseBody = await response.text();
  const contentType = response.headers.get('content-type') ?? 'application/json; charset=utf-8';

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': contentType,
    },
  });
}