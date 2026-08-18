'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Postmark from '@/components/Postmark';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function truncate(text, max = 110) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export default function HistoryClient() {
  const [history, setHistory] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dbError, setDbError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  // ── Fetch first page ────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async (q = '') => {
    setLoading(true);
    setDbError('');
    try {
      const url = `/api/history${q ? `?q=${encodeURIComponent(q)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load history');
      setHistory(data.records);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setDbError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(query); }, [query, fetchHistory]);

  // ── Load more (cursor-based pagination) ────────────────────────────────────
  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({ cursor: nextCursor });
      if (query) params.set('q', query);
      const res = await fetch(`/api/history?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHistory((prev) => [...prev, ...data.records]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setDbError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  function handleDelete(id) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await fetch('/api/history', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        setHistory((prev) => prev.filter((item) => item._id !== id));
        if (expandedId === id) setExpandedId(null);
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="page-wrap">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-caps" style={{ marginBottom: '0.875rem' }}>Archive</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: '0.375rem' }}>
          Reply History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {loading ? 'Loading...' : query
            ? `Results for "${query}"`
            : history.length > 0
              ? `${history.length}${hasMore ? '+' : ''} ${history.length === 1 ? 'reply' : 'replies'} on record`
              : 'No replies generated yet.'}
        </p>
      </div>

      {dbError && (
        <div className="alert-error" style={{ marginBottom: '2rem' }}>
          <span>—</span><span>{dbError}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: '56px', background: 'var(--surface)', borderRadius: '4px', opacity: 1 - i * 0.15, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && history.length === 0 && !dbError && (
        <div className="surface" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            {query ? `No results for "${query}"` : 'Nothing in the archive yet.'}
          </p>
          {!query && (
            <a href="/generator" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              Write your first reply
            </a>
          )}
        </div>
      )}

      {/* ── History list ─────────────────────────────────────────────────────── */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {history.map((item, i) => {
            const isExpanded = expandedId === item._id;
            const isDeleting = deletingId === item._id;
            const isLast = i === history.length - 1;

            return (
              <div
                key={item._id}
                style={{
                  background: 'var(--surface)',
                  borderLeft: '1px solid var(--border)',
                  borderRight: '1px solid var(--border)',
                  borderTop: '1px solid var(--border)',
                  borderBottom: isLast || isExpanded ? '1px solid var(--border)' : 'none',
                  borderRadius: i === 0 ? 'var(--radius-md) var(--radius-md) 0 0' : isLast ? '0 0 var(--radius-md) var(--radius-md)' : '0',
                }}
              >
                {/* Row header */}
                <div
                  style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                  onClick={() => setExpandedId((prev) => (prev === item._id ? null : item._id))}
                >
                  <Postmark tone={item.tone} size="sm" />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {truncate(item.original_email, 90)}
                    </p>
                  </div>
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {formatDate(item.created_at)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn-danger"
                      onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
                      disabled={isDeleting || isPending}
                      type="button"
                      id={`delete-history-${item._id}`}
                      style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem' }}
                    >
                      {isDeleting ? <span className="spinner" style={{ width: 10, height: 10 }} /> : 'Delete'}
                    </button>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.625rem', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s ease', display: 'inline-block' }}>▾</span>
                  </div>
                </div>

                {/* Expanded view */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <p className="label-caps" style={{ marginBottom: '0.625rem' }}>Original</p>
                      <div className="reply-box" style={{ background: 'var(--bg)', borderColor: 'var(--border-light)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {item.original_email}
                      </div>
                    </div>
                    <div>
                      <p className="label-caps" style={{ marginBottom: '0.625rem' }}>Reply</p>
                      <div className="reply-box" style={{ fontSize: '0.875rem' }}>{item.generated_reply}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Load More button (cursor-based pagination) ────────────────────── */}
      {hasMore && !loading && (
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn-ghost"
            id="btn-load-more-history"
            style={{ padding: '0.625rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {loadingMore ? (
              <><div className="spinner" style={{ borderTopColor: 'var(--accent)', borderColor: 'var(--border)' }} />Loading...</>
            ) : (
              'Load More Replies'
            )}
          </button>
          <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Showing {history.length} records
          </p>
        </div>
      )}
    </div>
  );
}
