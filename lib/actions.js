'use server';

import { getSupabaseAdmin } from '@/lib/supabase/client';
import { auth } from '@/auth';

// ─── Helper: get current user ID ─────────────────────────────────────────────
async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

// ─── Email History ────────────────────────────────────────────────────────────

export async function getHistory() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const userId = await getCurrentUserId();
  let query = supabase.from('email_history').select('*').order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Actions] getHistory error:', error.message);
    return [];
  }

  return (data || []).map((item) => ({
    ...item,
    _id: item.id,
    created_at: item.created_at ? new Date(item.created_at).toISOString() : null,
  }));
}

export async function deleteHistory(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !id) return;

  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('email_history')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('[Actions] deleteHistory error:', error.message);
    throw new Error('Failed to delete history item');
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function getTemplates() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const userId = await getCurrentUserId();
  let query = supabase.from('templates').select('*').order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Actions] getTemplates error:', error.message);
    return [];
  }

  return (data || []).map((t) => ({
    ...t,
    _id: t.id,
    created_at: t.created_at ? new Date(t.created_at).toISOString() : null,
  }));
}

export async function saveTemplate(replyText, label) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Database not configured');

  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('templates')
    .insert({
      user_id: userId || 'anonymous',
      label: label?.trim() || 'Untitled Template',
      reply_text: replyText,
    })
    .select()
    .single();

  if (error) {
    console.error('[Actions] saveTemplate error:', error.message);
    throw new Error('Failed to save template');
  }

  return {
    _id: data.id,
    label: data.label,
    reply_text: data.reply_text,
    created_at: data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function deleteTemplate(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !id) return;

  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('[Actions] deleteTemplate error:', error.message);
    throw new Error('Failed to delete template');
  }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { totalReplies: 0, mostRecent: null };

  const userId = await getCurrentUserId();
  if (!userId) return { totalReplies: 0, mostRecent: null };

  const { count } = await supabase
    .from('email_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { data: mostRecentList } = await supabase
    .from('email_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  const mostRecent = mostRecentList?.[0] || null;

  return {
    totalReplies: count || 0,
    mostRecent: mostRecent
      ? {
          ...mostRecent,
          _id: mostRecent.id,
          created_at: mostRecent.created_at ? new Date(mostRecent.created_at).toISOString() : null,
        }
      : null,
  };
}
