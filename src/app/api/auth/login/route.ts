import { NextRequest, NextResponse } from 'next/server';
import type { LoginRequest, LoginResponse } from '@/types/api';
import { supabaseAdmin } from '@/lib/supabase';
import { randomBytes } from 'crypto';
import { withCors, handleCorsOptions } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsOptions(request);
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    if (!body.id || typeof body.id !== 'string') {
      return withCors(
        NextResponse.json({ error: 'Invalid user id' }, { status: 400 }),
        request
      );
    }

    const { data: existingUser } = await supabaseAdmin()
      .from('users')
      .select('id')
      .eq('id', body.id)
      .single();

    if (!existingUser) {
      const { error: insertError } = await supabaseAdmin()
        .from('users')
        .insert([{ id: body.id }]);

      if (insertError) {
        console.error('Error creating user:', insertError);
        return withCors(
          NextResponse.json({ error: 'Failed to create user' }, { status: 500 }),
          request
        );
      }
    }

    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: sessionError } = await supabaseAdmin()
      .from('user_sessions')
      .insert([{
        user_id: body.id,
        token,
        expires_at: expiresAt.toISOString(),
      }]);

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return withCors(
        NextResponse.json({ error: 'Failed to create session' }, { status: 500 }),
        request
      );
    }

    const response: LoginResponse = {
      token,
    };

    return withCors(NextResponse.json(response, { status: 200 }), request);
  } catch (error) {
    console.error('Login error:', error);
    return withCors(
      NextResponse.json({ error: 'Invalid request' }, { status: 400 }),
      request
    );
  }
}
