import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { auth } from '@/auth';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'You must be signed in to change your password.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email?.toLowerCase().trim())
      .maybeSingle();

    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // If the user already has a password set, verify current password
    if (user.password) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required.' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
      }
    }

    // Hash and save new password
    const hashed = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashed })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ message: 'Password updated successfully!' }, { status: 200 });
  } catch (error) {
    console.error('[ChangePassword] Error:', error);
    return NextResponse.json({ error: 'An error occurred while updating your password.' }, { status: 500 });
  }
}
