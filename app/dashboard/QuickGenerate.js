'use client';

import { useState } from 'react';
import Postmark from '@/components/Postmark';
import { Sparkles, Mail, Copy, Check, BellRing, X, RotateCcw, PlusCircle } from 'lucide-react';
import { triggerLocalNotification } from '@/lib/firebase/client';

export default function QuickGenerate() {
  const [email, setEmail] = useState('');
  const [tone, setTone] = useState('formal');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [toastNotification, setToastNotification] = useState(null);

  const handleClear = () => {
    setEmail('');
    setError('');
  };

  const handleNewMail = () => {
    setEmail('');
    setReply(null);
    setError('');
    setToastNotification(null);
  };

  const handleGenerate = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setReply(null);
    setToastNotification(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', originalEmail: email, tone, length: 'default', variations: 1, useEmojis: false }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned status ${res.status}. Please check your server or connection.`);
      }
      if (!res.ok) throw new Error(data?.error || `Failed to generate reply (Status ${res.status})`);
      if (!data?.reply || !Array.isArray(data.reply) || data.reply.length === 0) {
        throw new Error('No reply generated. Please try again.');
      }

      const generatedText = data.reply[0];
      setReply(generatedText);

      // 1. Show floating In-App Toast Notification
      setToastNotification({
        title: '⚡ MailGenius AI Ready!',
        body: `Your ${tone} email reply has been generated successfully!`,
      });

      // 2. Trigger OS Desktop Notification (if permitted)
      triggerLocalNotification({
        title: '⚡ MailGenius: AI Reply Ready!',
        body: `Your ${tone} email reply is ready to copy and send.`,
      });

      // Auto dismiss toast after 6 seconds
      setTimeout(() => setToastNotification(null), 6000);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
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
    <div className="surface" style={{ padding: '1.75rem', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '14px', position: 'relative' }}>
      
      {/* ── Real-Time Popup Notification Toast (Always Visible on Screen) ── */}
      {toastNotification && (
        <div
          style={{
            position: 'absolute',
            top: '-1rem',
            right: '1rem',
            zIndex: 999,
            background: 'var(--surface)',
            border: '1.5px solid var(--accent)',
            borderRadius: '12px',
            padding: '0.875rem 1.25rem',
            boxShadow: '0 12px 30px -5px rgba(2, 132, 199, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            minWidth: '280px',
            maxWidth: '380px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BellRing style={{ width: '1.125rem', height: '1.125rem' }} className="animate-bounce" />
          </div>
          <div style={{ flex: 1 }}>
            <h5 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              {toastNotification.title}
            </h5>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              {toastNotification.body}
            </p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.2rem' }}
          >
            <X style={{ width: '0.875rem', height: '0.875rem' }} />
          </button>
        </div>
      )}

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <strong style={{ color: 'var(--accent)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generated Reply</strong>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <button
                onClick={handleCopy}
                className="btn-ghost"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                {copied ? <Check className="w-3 h-3 text-[var(--success)]" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleNewMail}
                className="btn-ghost"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent)' }}
                title="Start a new email"
              >
                <PlusCircle className="w-3 h-3" /> New Mail
              </button>
            </div>
          </div>
          <p style={{ color: 'var(--text)', whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.8125rem' }}>{reply}</p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', flexWrap: 'wrap', gap: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tone:</span>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-raised)', color: 'var(--text)', fontSize: '0.8125rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="formal">👔 Formal</option>
              <option value="friendly">👋 Friendly</option>
              <option value="concise">⚡ Concise</option>
              <option value="persuasive">🎯 Persuasive</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleClear}
              disabled={!email}
              className="btn-ghost"
              style={{
                padding: '0.35rem 0.6rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                opacity: !email ? 0.4 : 1,
                cursor: !email ? 'not-allowed' : 'pointer',
              }}
              title="Clear incoming email text"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
            <button
              type="button"
              onClick={handleNewMail}
              disabled={!email && !reply}
              className="btn-ghost"
              style={{
                padding: '0.35rem 0.6rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: 'var(--accent)',
                opacity: (!email && !reply) ? 0.4 : 1,
                cursor: (!email && !reply) ? 'not-allowed' : 'pointer',
              }}
              title="Reset & start brand new email"
            >
              <PlusCircle className="w-3 h-3" /> New Mail
            </button>
          </div>
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
