import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import EmailHistory from '@/lib/models/EmailHistory';
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

    await connectDB();

    const query = userId ? { userId } : { userId: null };

    // ── Search filter ─────────────────────────────────────────────────────────
    if (q) {
      query.$or = [
        { original_email: { $regex: q, $options: 'i' } },
        { generated_reply: { $regex: q, $options: 'i' } },
        { tone: { $regex: q, $options: 'i' } },
      ];
    }

    // ── Cursor-based pagination ───────────────────────────────────────────────
    // Cursor = created_at of the last item we returned. Next page = items older than that.
    if (cursor) {
      query.created_at = { $lt: new Date(cursor) };
    }

    const items = await EmailHistory.find(query)
      .sort({ created_at: -1 })
      .limit(PAGE_SIZE + 1) // fetch one extra to know if there's a next page
      .lean();

    const hasMore = items.length > PAGE_SIZE;
    const records = items.slice(0, PAGE_SIZE).map((item) => ({
      ...item,
      _id: item._id.toString(),
      created_at: item.created_at?.toISOString() ?? null,
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

    await connectDB();
    await EmailHistory.findOneAndDelete({ _id: id, userId });
    logger.info('History item deleted', { id, userId });

    logResponse('DELETE /api/history', 200, Date.now() - start);
    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Error in DELETE /api/history', { error: error?.message });
    logResponse('DELETE /api/history', 500, Date.now() - start);
    return NextResponse.json({ error: 'Failed to delete item.' }, { status: 500 });
  }
}
