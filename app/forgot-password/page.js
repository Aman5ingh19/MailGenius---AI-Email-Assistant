'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div className="auth-brand-badge">
            <Sparkles className="w-5 h-5 text-[#0284C7]" />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.375rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 0.25rem 0',
              lineHeight: 1.2,
            }}
          >
            Reset Password
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.8125rem', margin: 0 }}>
            Enter your email to receive a recovery link.
          </p>
        </div>

        {error && (
          <div
            className="alert-error"
            style={{
              marginBottom: '0.875rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8125rem',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div
            className="alert-success"
            style={{
              marginBottom: '0.875rem',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8125rem',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div className="auth-input-wrapper" style={{ marginBottom: '0.875rem' }}>
              <Mail className="w-4 h-4 auth-input-icon" />
              <input
                type="email"
                required
                className="auth-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary"
              style={{
                width: '100%',
                height: '38px',
                padding: '0.55rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: '#0284C7',
                color: '#FFFFFF',
                borderRadius: '8px',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {loading ? <><div className="spinner" style={{ width: '14px', height: '14px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Sending Link...</> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#0284C7',
              textDecoration: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>

        {/* ── Card Footer: MailGenius — Built by Aman Singh ── */}
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.625rem',
            borderTop: '1px solid #E2E8F0',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              color: '#64748B',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              margin: 0,
            }}
          >
            <span style={{ fontWeight: 700, color: '#0F172A' }}>MailGenius</span>
            <span style={{ color: '#94A3B8' }}>—</span>
            <span>Built by</span>
            <strong style={{ color: '#0284C7', fontWeight: 700 }}>Aman Singh</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
