import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { auth } from '@/auth';
import logger, { logRequest, logResponse } from '@/lib/logger';

const PAGE_SIZE = 10;

export async function GET(request) {
  const start = Date.now();
  logRequest(request, 'GET /api/history');

  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor'); // ISO date string of the last item
    const q = searchParams.get('q')?.trim() || '';

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ records: [], nextCursor: null, hasMore: false });
    }

    let query = supabase
      .from('email_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE + 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Search filter (ILIKE across fields)
    if (q) {
      query = query.or(`original_email.ilike.%${q}%,generated_reply.ilike.%${q}%,tone.ilike.%${q}%`);
    }

    // Cursor pagination (fetch older than cursor)
    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: items, error } = await query;

    if (error) {
      logger.error('Supabase query error in GET /api/history', { error: error.message });
      return NextResponse.json({ error: 'Failed to fetch history.' }, { status: 500 });
    }

    const results = items || [];
    const hasMore = results.length > PAGE_SIZE;
    const records = results.slice(0, PAGE_SIZE).map((item) => ({
      ...item,
      _id: item.id,
      created_at: item.created_at ? new Date(item.created_at).toISOString() : null,
    }));

    const nextCursor = hasMore ? records[records.length - 1].created_at : null;

    logResponse('GET /api/history', 200, Date.now() - start);
    return NextResponse.json({ records, nextCursor, hasMore });

  } catch (error) {
    logger.error('Error in GET /api/history', { error: error?.message });
    logResponse('GET /api/history', 500, Date.now() - start);
    return NextResponse.json({ error: 'Failed to fetch history.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const start = Date.now();
  logRequest(request, 'DELETE /api/history');

  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    let deleteQuery = supabase.from('email_history').delete().eq('id', id);
    if (userId) {
      deleteQuery = deleteQuery.eq('user_id', userId);
    }

    const { error } = await deleteQuery;
    if (error) {
      logger.error('Supabase error deleting history item', { error: error.message });
      return NextResponse.json({ error: 'Failed to delete item.' }, { status: 500 });
    }

    logger.info('History item deleted', { id, userId });
    logResponse('DELETE /api/history', 200, Date.now() - start);
    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Error in DELETE /api/history', { error: error?.message });
    logResponse('DELETE /api/history', 500, Date.now() - start);
    return NextResponse.json({ error: 'Failed to delete item.' }, { status: 500 });
  }
}
