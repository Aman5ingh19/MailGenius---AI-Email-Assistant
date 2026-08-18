'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const errorParam = searchParams.get('error');

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(
    errorParam === 'OAuthAccountNotLinked'
      ? 'This email is linked to a different provider. Try signing in with the original method.'
      : errorParam
        ? 'An authentication error occurred. Please try again.'
        : ''
  );
  const [success, setSuccess] = useState('');

  async function handleOAuth(provider) {
    setLoading(provider);
    setError('');
    await signIn(provider, { callbackUrl });
  }

  async function handleCredentials(e) {
    e.preventDefault();
    setLoading('credentials');
    setError('');
    setSuccess('');

    const res = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      isSignup: mode === 'signup' ? 'true' : 'false',
      redirect: false,
    });

    setLoading(null);

    if (res?.error) {
      setError(res.error);
    } else {
      if (mode === 'signup') {
        setSuccess('Account created! Redirecting...');
      }
      router.push(callbackUrl);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', background: 'var(--accent-dim)', color: 'var(--accent)', marginBottom: '1rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
            MailGenius
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {/* Error/Success alerts */}
        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(192,69,90,0.1)', border: '1px solid rgba(192,69,90,0.3)', borderRadius: '8px', color: 'var(--accent)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '0.75rem 1rem', background: 'var(--success-dim)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: 'var(--success)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {success}
          </div>
        )}

        {/* Credentials form */}
        <form onSubmit={handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {mode === 'signup' && (
            <input
              className="auth-input"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required={mode === 'signup'}
              id="input-name"
            />
          )}
          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            id="input-email"
          />
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              id="input-password"
              style={{ marginBottom: '0.25rem' }}
            />
            {mode === 'login' && (
              <div style={{ textAlign: 'right' }}>
                <Link href="/forgot-password" style={{ color: 'var(--accent)', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={!!loading}
            id="btn-submit-credentials"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', justifyContent: 'center' }}
          >
            {loading === 'credentials' ? (
              <><div className="spinner" /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle mode */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
            id="btn-toggle-mode"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {/* ── Guest Divider ─────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0 1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>or try without an account</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
        </div>

        {/* Guest Login Button */}
        <button
          onClick={() => router.push('/generator')}
          id="btn-guest-login"
          disabled={!!loading}
          style={{
            width: '100%', padding: '0.75rem', background: 'transparent',
            border: '1px dashed var(--border)', borderRadius: '8px',
            color: 'var(--text-muted)', fontSize: '0.9375rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
            fontFamily: 'var(--font-ui)', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          Continue as Guest
        </button>
        <p style={{ textAlign: 'center', marginTop: '0.625rem', fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Guest mode: Generate replies freely. History & saved templates require an account.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
