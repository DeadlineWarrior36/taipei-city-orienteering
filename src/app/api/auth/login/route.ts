import { NextRequest, NextResponse } from 'next/server';
import type { LoginRequest, LoginResponse } from '@/types/api';
import { supabaseAdmin } from '@/lib/supabase';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    if (!body.id || typeof body.id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid user id' },
        { status: 400 }
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
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
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
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    const response: LoginResponse = {
      token,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
