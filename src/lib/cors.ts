import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
];

export function getCorsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin || '' : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
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
