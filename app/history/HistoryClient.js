'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Postmark from '@/components/Postmark';
import Link from 'next/link';
import {
  History,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  Calendar,
  AlertCircle,
  ExternalLink,
  Send,
  Filter,
  CheckCircle2,
} from 'lucide-react';

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
  const [copiedId, setCopiedId] = useState(null);
  const [selectedTone, setSelectedTone] = useState('all');
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  // Fetch first page
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

  // Load more
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

  // Delete
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

  async function handleCopy(id, text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleReuse(replyText) {
    sessionStorage.setItem('prefillReply', replyText);
    router.push('/generator?reuse=1');
  }

  const filteredHistory = selectedTone === 'all'
    ? history
    : history.filter(item => item.tone === selectedTone);

  return (
    <div className="page-wrap" style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* ── Top Header Banner ──────────────────────────────────────── */}
      <div
        className="surface"
        style={{
          borderRadius: '16px',
          padding: '2rem 2.25rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-raised) 100%)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '999px',
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                border: '1px solid var(--accent-border)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Archive &amp; Logs
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {history.length} {history.length === 1 ? 'record' : 'records'} cached
            </span>
          </div>

          <h1 className="display-title" style={{ fontSize: '2rem', marginBottom: '0.375rem' }}>
            Reply History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            {query ? `Filtered by search query: "${query}"` : 'Browse, search, and reuse past AI-generated responses.'}
          </p>
        </div>

        <Link href="/generator" className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
          <Sparkles className="w-4 h-4" /> New Studio Reply
        </Link>
      </div>

      {/* ── Filter Tabs & Stats ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--surface)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
          {[
            { value: 'all', label: 'All Replies' },
            { value: 'formal', label: 'Formal' },
            { value: 'friendly', label: 'Friendly' },
            { value: 'concise', label: 'Concise' },
            { value: 'persuasive', label: 'Persuasive' },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setSelectedTone(t.value)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '7px',
                border: 'none',
                background: selectedTone === t.value ? 'var(--accent)' : 'transparent',
                color: selectedTone === t.value ? 'var(--btn-primary-text)' : 'var(--text-muted)',
                fontWeight: selectedTone === t.value ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {query && (
          <Link href="/history" className="btn-ghost" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}>
            Clear search filter
          </Link>
        )}
      </div>

      {dbError && (
        <div className="alert-error" style={{ marginBottom: '2rem' }}>
          <AlertCircle className="w-4 h-4" />
          <span>{dbError}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--text-muted)', gap: '0.5rem' }}>
          <div className="spinner" style={{ width: '18px', height: '18px', borderColor: 'var(--accent-dim)', borderTopColor: 'var(--accent)' }} />
          <span>Loading archives…</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredHistory.length === 0 && !dbError && (
        <div className="surface" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <History className="w-6 h-6" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            {query ? `No replies matching "${query}"` : 'No history found'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
            {query ? 'Try searching for different keywords or clear the filter.' : 'Generate your first response to automatically archive it in your vault.'}
          </p>
          <Link href="/generator" className="btn-primary" style={{ padding: '0.5625rem 1.25rem', fontSize: '0.875rem' }}>
            <Sparkles className="w-4 h-4" /> Generate a Reply
          </Link>
        </div>
      )}

      {/* ── History Cards List ──────────────────────────────────────── */}
      {!loading && filteredHistory.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredHistory.map((item) => {
            const isExpanded = expandedId === item._id;
            const isDeleting = deletingId === item._id;
            const isCopied = copiedId === item._id;

            return (
              <div
                key={item._id}
                className="surface"
                style={{
                  borderRadius: '14px',
                  padding: '1.5rem',
                  transition: 'all 0.2s ease',
                  border: isExpanded ? '1px solid var(--accent)' : '1px solid var(--border)',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <Postmark tone={item.tone} size="sm" />
                    <div>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'block' }}>
                        {truncate(item.original_email, 65) || 'Email Conversation'}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar className="w-3 h-3" /> {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleCopy(item._id, item.generated_reply)}
                      className="btn-ghost"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      {isCopied ? <><Check className="w-3 h-3 text-[var(--success)]" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                    <button
                      onClick={() => handleReuse(item.generated_reply)}
                      className="btn-accent-ghost"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      title="Open in Studio"
                    >
                      <Send className="w-3 h-3" /> Studio
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item._id)}
                      className="btn-ghost"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      {isExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Less</> : <><ChevronDown className="w-3.5 h-3.5" /> View</>}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={isDeleting || isPending}
                      className="btn-danger"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      title="Delete entry"
                    >
                      {isDeleting ? <div className="spinner" style={{ width: 10, height: 10 }} /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Content snippet / expanded body */}
                {isExpanded ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                    <div>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>Original Incoming Thread</span>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', background: 'var(--surface-raised)', padding: '0.875rem', borderRadius: '8px', marginTop: '0.35rem', lineHeight: 1.6 }}>
                        {item.original_email}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.06em' }}>Generated Response</span>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text)', background: 'var(--accent-dim)', padding: '1rem', borderRadius: '8px', marginTop: '0.35rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', border: '1px solid var(--accent-border)' }}>
                        {item.generated_reply}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, background: 'var(--surface-raised)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                    {truncate(item.generated_reply, 160)}
                  </p>
                )}
              </div>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-ghost"
                style={{ padding: '0.625rem 1.75rem', fontSize: '0.875rem' }}
              >
                {loadingMore ? 'Loading more archives…' : 'Load More Records'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
