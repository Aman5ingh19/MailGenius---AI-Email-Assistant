import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
    }

    // Find the token
    const { data: resetTokenRecord } = await supabase
      .from('reset_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (!resetTokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Find the user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', resetTokenRecord.email)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashed = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashed })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Delete the used token
    await supabase.from('reset_tokens').delete().eq('id', resetTokenRecord.id);

    return NextResponse.json(
      { message: 'Password has been successfully reset.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password.' },
      { status: 500 }
    );
  }
}
