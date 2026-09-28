import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service is temporarily unavailable.' }, { status: 500 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        name: (name || 'User').trim(),
        email: normalizedEmail,
        password: hashed,
        provider: 'credentials',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[Register] Supabase insert error:', insertError.message);
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Account created successfully!', userId: user.id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Register] Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during account creation. Please try again.' },
      { status: 500 }
    );
  }
}
