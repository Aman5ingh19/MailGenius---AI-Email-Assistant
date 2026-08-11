'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTemplate } from '@/lib/actions';

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

  return (
    <div className="page-wrap">

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-caps" style={{ marginBottom: '0.875rem' }}>Collection</p>
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
          Saved templates
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {templates.length > 0
            ? `${templates.length} ${templates.length === 1 ? 'template' : 'templates'} saved`
            : 'No templates saved yet.'}
        </p>
      </div>

      {dbError && (
        <div className="alert-error" style={{ marginBottom: '2rem' }}>
          <span>—</span><span>{dbError}</span>
        </div>
      )}

      {/* Empty state */}
      {templates.length === 0 && !dbError && (
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
            Save your best replies here<br />for quick reuse.
          </p>
          <a href="/generator" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            Write a reply to save
          </a>
        </div>
      )}

      {/* ── Templates grid ────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        {templates.map((t) => {
          const isExpanded = expandedId === t._id;
          const isDeleting = deletingId === t._id;
          const isCopied = copiedId === t._id;

          return (
            <div
              key={t._id}
              style={{
                background: 'var(--surface)',
                padding: '1.375rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
              }}
            >
              {/* Label + date row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: '0.25rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {t.label}
                  </h3>
                  <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                    {formatDate(t.created_at)}
                  </span>
                </div>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(t._id)}
                  disabled={isDeleting || isPending}
                  type="button"
                  id={`delete-template-${t._id}`}
                  style={{ padding: '0.3125rem 0.625rem', fontSize: '0.75rem', flexShrink: 0 }}
                >
                  {isDeleting ? <span className="spinner" style={{ width: 10, height: 10 }} /> : 'Delete'}
                </button>
              </div>

              {/* Hairline divider */}
              <div className="divider" />

              {/* Preview text */}
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  cursor: 'pointer',
                  flex: 1,
                }}
                onClick={() => setExpandedId((prev) => (prev === t._id ? null : t._id))}
              >
                {isExpanded ? t.reply_text : truncate(t.reply_text)}
                {!isExpanded && t.reply_text.length > 180 && (
                  <span style={{ color: 'var(--accent)', marginLeft: '0.25rem' }}>
                    {' '}Read more
                  </span>
                )}
              </p>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  id={`copy-template-${t._id}`}
                  className="btn-ghost"
                  onClick={() => handleCopy(t._id, t.reply_text)}
                  type="button"
                  style={{ flex: 1, fontSize: '0.8125rem', padding: '0.4375rem 0' }}
                >
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
                <button
                  id={`reuse-template-${t._id}`}
                  className="btn-accent-ghost"
                  onClick={() => handleReuse(t.reply_text)}
                  type="button"
                  style={{ flex: 1, fontSize: '0.8125rem', padding: '0.4375rem 0' }}
                >
                  Use in generator
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
