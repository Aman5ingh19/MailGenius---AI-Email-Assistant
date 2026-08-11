'use client';

import { useState, useTransition, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { deleteHistory } from '@/lib/actions';
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

export default function HistoryClient({ history: initialHistory, dbError }) {
  const [history, setHistory] = useState(initialHistory);
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const filteredHistory = useMemo(() => {
    if (!query) return history;
    const lowerQuery = query.toLowerCase();
    return history.filter(item => 
      (item.original_email && item.original_email.toLowerCase().includes(lowerQuery)) ||
      (item.generated_reply && item.generated_reply.toLowerCase().includes(lowerQuery))
    );
  }, [history, query]);

  function handleToggle(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleDelete(id) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteHistory(id);
        setHistory((prev) => prev.filter((item) => item._id !== id));
        if (expandedId === id) setExpandedId(null);
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <div className="page-wrap">

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-caps" style={{ marginBottom: '0.875rem' }}>Archive</p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.875rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            color: 'var(--text)',
            marginBottom: '0.375rem',
          }}
        >
          Reply history
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {query ? (
            `Found ${filteredHistory.length} ${filteredHistory.length === 1 ? 'result' : 'results'} for "${query}"`
          ) : (
            filteredHistory.length > 0
              ? `${filteredHistory.length} ${filteredHistory.length === 1 ? 'reply' : 'replies'} on record`
              : 'No replies generated yet.'
          )}
        </p>
      </div>

      {dbError && (
        <div className="alert-error" style={{ marginBottom: '2rem' }}>
          <span>—</span><span>{dbError}</span>
        </div>
      )}

      {/* Empty state */}
      {filteredHistory.length === 0 && !dbError && (
        <div
          className="surface"
          style={{ padding: '3rem 2rem', textAlign: 'center' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.125rem',
              fontStyle: 'italic',
              color: 'var(--text-muted)',
              marginBottom: '1.25rem',
            }}
          >
            Nothing in the archive yet.
          </p>
          <a href="/generator" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Write your first reply
          </a>
        </div>
      )}

      {/* ── History list ──────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filteredHistory.map((item, i) => {
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
                borderRadius: i === 0
                  ? 'var(--radius-md) var(--radius-md) 0 0'
                  : isLast
                    ? '0 0 var(--radius-md) var(--radius-md)'
                    : '0',
              }}
            >
              {/* Row header */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto auto',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                }}
                onClick={() => handleToggle(item._id)}
              >
                {/* Postmark stamp */}
                <Postmark tone={item.tone} size="sm" />

                {/* Preview */}
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {truncate(item.original_email, 90)}
                  </p>
                </div>

                {/* Date */}
                <span
                  className="mono"
                  style={{ fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}
                >
                  {formatDate(item.created_at)}
                </span>

                {/* Actions */}
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
                  <span
                    style={{
                      color: 'var(--text-dim)',
                      fontSize: '0.625rem',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.15s ease',
                      display: 'inline-block',
                    }}
                  >
                    ▾
                  </span>
                </div>
              </div>

              {/* Expanded view */}
              {isExpanded && (
                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    padding: '1.25rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.25rem',
                  }}
                >
                  <div>
                    <p className="label-caps" style={{ marginBottom: '0.625rem' }}>Original</p>
                    <div
                      className="reply-box"
                      style={{
                        background: 'var(--bg)',
                        borderColor: 'var(--border-light)',
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {item.original_email}
                    </div>
                  </div>
                  <div>
                    <p className="label-caps" style={{ marginBottom: '0.625rem' }}>Reply</p>
                    <div className="reply-box" style={{ fontSize: '0.875rem' }}>
                      {item.generated_reply}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
