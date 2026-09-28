import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { auth } from '@/auth';

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
    }

    const email = session.user.email?.toLowerCase().trim();
    const { data: user, error } = await supabase
      .from('users')
      .update({ name: name.trim() })
      .eq('email', email)
      .select('name')
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', name: user.name }, { status: 200 });
  } catch (error) {
    console.error('[ProfileUpdate] Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
