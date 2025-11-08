import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['*'];

export function getCorsHeaders(origin: string | null) {
  const allowAll = allowedOrigins.includes('*');
  const isAllowed = allowAll || (origin && allowedOrigins.includes(origin));

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (allowAll) {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (isAllowed && origin) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

export function handleCorsOptions(request: NextRequest) {
  const origin = request.headers.get('origin');
  return NextResponse.json({}, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

export function withCors(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
