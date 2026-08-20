'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTemplate } from '@/lib/actions';
import Link from 'next/link';
import {
  Bookmark,
  Copy,
  Check,
  Trash2,
  Send,
  Calendar,
  Sparkles,
  AlertCircle,
  Search,
  CheckCircle2,
} from 'lucide-react';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function truncate(text, max = 180) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export default function SavedClient({ templates: initialTemplates, dbError }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

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

  function handleReuse(text) {
    sessionStorage.setItem('prefillReply', text);
    router.push('/generator?reuse=1');
  }

  function handleDelete(id) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteTemplate(id);
        setTemplates((prev) => prev.filter((t) => t._id !== id));
        if (expandedId === id) setExpandedId(null);
      } finally {
        setDeletingId(null);
      }
    });
  }

  const filteredTemplates = searchQuery.trim()
    ? templates.filter(
        (t) =>
          t.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.reply_text?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : templates;

  return (
    <div className="page-wrap" style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '3.5rem' }}>
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
              Vault &amp; Presets
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {templates.length} {templates.length === 1 ? 'saved template' : 'saved templates'}
            </span>
          </div>

          <h1 className="display-title" style={{ fontSize: '2rem', marginBottom: '0.375rem' }}>
            Saved Templates
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Bookmark recurring responses and launch them directly into the generator.
          </p>
        </div>

        <Link href="/generator" className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
          <Sparkles className="w-4 h-4" /> Create New Reply
        </Link>
      </div>

      {/* ── Search & Filter Controls ────────────────────────────────── */}
      {templates.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search className="w-4 h-4 text-[var(--text-dim)]" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search saved templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base"
              style={{ padding: '0.5rem 1rem 0.5rem 2.375rem', fontSize: '0.875rem' }}
            />
          </div>

          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Showing {filteredTemplates.length} of {templates.length}
          </span>
        </div>
      )}

      {dbError && (
        <div className="alert-error" style={{ marginBottom: '2rem' }}>
          <AlertCircle className="w-4 h-4" />
          <span>{dbError}</span>
        </div>
      )}

      {/* Empty state */}
      {filteredTemplates.length === 0 && !dbError && (
        <div className="surface" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            {searchQuery ? `No templates matching "${searchQuery}"` : 'No saved templates yet'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
            {searchQuery
              ? 'Try different keywords or clear your search query.'
              : 'Save high-performing email replies from the Studio to quickly reuse them anytime.'}
          </p>
          <Link href="/generator" className="btn-primary" style={{ padding: '0.5625rem 1.25rem', fontSize: '0.875rem' }}>
            <Sparkles className="w-4 h-4" /> Write a Response
          </Link>
        </div>
      )}

      {/* ── Templates Grid ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredTemplates.map((t) => {
          const isExpanded = expandedId === t._id;
          const isDeleting = deletingId === t._id;
          const isCopied = copiedId === t._id;

          return (
            <div
              key={t._id}
              className="surface"
              style={{
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'all 0.2s ease',
                border: isExpanded ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.25rem' }}>
                    {t.label}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar className="w-3 h-3" /> {formatDate(t.created_at)}
                  </span>
                </div>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(t._id)}
                  disabled={isDeleting || isPending}
                  type="button"
                  id={`delete-template-${t._id}`}
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', flexShrink: 0 }}
                  title="Delete template"
                >
                  {isDeleting ? <div className="spinner" style={{ width: 10, height: 10 }} /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Body Content */}
              <div
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text)',
                  lineHeight: 1.6,
                  cursor: 'pointer',
                  flex: 1,
                  background: 'var(--surface-raised)',
                  padding: '1rem',
                  borderRadius: '10px',
                  whiteSpace: 'pre-wrap',
                  border: '1px solid var(--border-light)',
                }}
                onClick={() => setExpandedId((prev) => (prev === t._id ? null : t._id))}
              >
                {isExpanded ? t.reply_text : truncate(t.reply_text, 180)}
                {!isExpanded && t.reply_text?.length > 180 && (
                  <span style={{ color: 'var(--accent)', fontWeight: 600, marginLeft: '0.25rem' }}>
                    {' '}Read full template
                  </span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                <button
                  id={`copy-template-${t._id}`}
                  className="btn-ghost"
                  onClick={() => handleCopy(t._id, t.reply_text)}
                  type="button"
                  style={{ flex: 1, fontSize: '0.8125rem', padding: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  {isCopied ? <><Check className="w-3.5 h-3.5 text-[var(--success)]" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button
                  id={`reuse-template-${t._id}`}
                  className="btn-primary"
                  onClick={() => handleReuse(t.reply_text)}
                  type="button"
                  style={{ flex: 1, fontSize: '0.8125rem', padding: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                >
                  <Send className="w-3.5 h-3.5" /> Use in Studio
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
