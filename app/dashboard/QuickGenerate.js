'use client';

import { useState } from 'react';
import Postmark from '@/components/Postmark';

export default function QuickGenerate() {
  const [email, setEmail] = useState('');
  const [tone, setTone] = useState('formal');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState(null);
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

  return (
    <div className="surface" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <Postmark tone="formal" size="sm" />
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)' }}>Quick Generate</h2>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Paste an email and let MailGenius craft the perfect response.
      </p>

      <div style={{ flex: 1, position: 'relative', marginBottom: '1.25rem' }}>
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', color: 'var(--text-dim)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <textarea
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Paste the email content here..."
          className="input-base"
          style={{ width: '100%', height: '100%', minHeight: '160px', padding: '1rem 1rem 1rem 2.75rem', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '0.9375rem' }}
        />
        <div style={{ position: 'absolute', bottom: '0.75rem', right: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          {email.length} / 5000
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: '1rem', padding: '0.75rem' }}>{error}</div>}

      {reply && (
        <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.875rem', maxHeight: '150px', overflowY: 'auto' }}>
          <strong>Generated Reply:</strong><br />
          {reply}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tone</span>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            style={{ padding: '0.5rem 2rem 0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: '#fff', fontSize: '0.875rem', outline: 'none' }}
          >
            <option value="formal">👔 Professional</option>
            <option value="friendly">👋 Friendly</option>
            <option value="concise">⚡ Concise</option>
            <option value="persuasive">🎯 Persuasive</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !email.trim()}
          className="btn-primary"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {loading ? 'Generating...' : 'Generate Reply ✨'}
        </button>
      </div>
    </div>
  );
}
