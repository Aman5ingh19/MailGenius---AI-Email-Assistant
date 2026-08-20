'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="alert-error" style={{ marginBottom: '1rem', padding: '0.75rem', fontSize: '0.8125rem' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Invalid or missing reset token. Please request a new password reset link.</span>
        </div>
        <Link href="/forgot-password" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600, fontSize: '0.8125rem' }}>
          Go to Forgot Password
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setMessage(data.message);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="alert-error" style={{ marginBottom: '0.875rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div className="alert-success" style={{ marginBottom: '0.875rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{message}<br/>Redirecting to login...</span>
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div className="auth-input-wrapper">
            <Lock className="w-4 h-4 auth-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              className="auth-input"
              placeholder="New Password (min. 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.2rem',
              }}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="auth-input-wrapper" style={{ marginBottom: '0.875rem' }}>
            <Lock className="w-4 h-4 auth-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              className="auth-input"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.2rem',
              }}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
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
            {loading ? <><div className="spinner" style={{ width: '14px', height: '14px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> Resetting...</> : 'Reset Password'}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
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
            Create New Password
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.8125rem', margin: 0 }}>
            Enter your new password credentials below.
          </p>
        </div>

        <Suspense fallback={<div style={{ textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>

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
