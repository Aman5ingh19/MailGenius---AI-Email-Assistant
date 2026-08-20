'use client';

import { useState } from 'react';
import Postmark from '@/components/Postmark';
import { Sparkles, Mail, Copy, Check } from 'lucide-react';

export default function QuickGenerate() {
  const [email, setEmail] = useState('');
  const [tone, setTone] = useState('formal');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setReply(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalEmail: email, tone, length: 'default', variations: 1, useEmojis: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      setReply(data.reply[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reply) return;
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="surface" style={{ padding: '1.75rem', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles className="w-4 h-4" />
        </div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Quick Generate</h2>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Paste an email snippet and craft an instant reply.
      </p>

      <div style={{ flex: 1, position: 'relative', marginBottom: '1.25rem' }}>
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', color: 'var(--text-dim)' }}>
          <Mail className="w-4 h-4" />
        </div>
        <textarea
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Paste incoming email text here..."
          className="input-base"
          style={{ width: '100%', height: '100%', minHeight: '160px', padding: '1rem 1rem 1.75rem 2.75rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text)' }}
        />
        <div style={{ position: 'absolute', bottom: '0.625rem', right: '0.875rem', fontSize: '0.6875rem', color: 'var(--text-dim)', background: 'var(--surface)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
          {email.length} / 5000
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1rem', padding: '0.75rem' }}>{error}</div>}

      {reply && (
        <div style={{ padding: '1rem', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.875rem', maxHeight: '160px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generated Reply</strong>
            <button
              onClick={handleCopy}
              className="btn-ghost"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              {copied ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p style={{ color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.8125rem' }}>{reply}</p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', flexWrap: 'wrap', gap: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tone:</span>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            style={{ padding: '0.45rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-raised)', color: 'var(--text)', fontSize: '0.8125rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value="formal">👔 Formal</option>
            <option value="friendly">👋 Friendly</option>
            <option value="concise">⚡ Concise</option>
            <option value="persuasive">🎯 Persuasive</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !email.trim()}
          className="btn-primary"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {loading ? <><div className="spinner" /> Generating...</> : <><Sparkles className="w-3.5 h-3.5" /> Generate Reply</>}
        </button>
      </div>
    </div>
  );
}
