'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, User, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const errorParam = searchParams.get('error');

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(
    errorParam === 'OAuthAccountNotLinked'
      ? 'This email is linked to a different provider. Try signing in with the original method.'
      : errorParam === 'CredentialsSignin'
        ? 'Invalid email or password.'
        : errorParam && errorParam !== 'Configuration'
          ? 'An authentication error occurred. Please try again.'
          : ''
  );
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const name = formData.name.trim();

    try {
      if (mode === 'signup') {
        // 1. Dedicated Registration Endpoint
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const regData = await regRes.json();

        if (!regRes.ok) {
          setError(regData.error || 'Failed to create account.');
          setLoading(false);
          return;
        }

        // 2. Automatically sign in after signup
        setSuccess('Account created! Signing you in...');
        const authRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (authRes?.error) {
          setError('Account created, but sign in failed. Please switch to Sign In.');
          setLoading(false);
          return;
        }

        router.push(callbackUrl);
        router.refresh();
      } else {
        // Standard Sign In
        const authRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (authRes?.error || !authRes?.ok) {
          setError('Invalid email or password. Please check your credentials.');
          setLoading(false);
          return;
        }

        setSuccess('Signed in successfully! Redirecting...');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError(err.message || 'An unexpected network error occurred.');
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Subtle ambient background glowing accents */}
      <div className="auth-bg-glow-1" />
      <div className="auth-bg-glow-2" />
      <div className="auth-bg-grid" />

      {/* Main Compact SaaS Auth Card */}
      <div className="auth-card">
        {/* Brand & Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.125rem' }}>
          <div className="auth-brand-badge">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.375rem',
              color: 'var(--text)',
              letterSpacing: '-0.02em',
              margin: '0 0 0.2rem 0',
              lineHeight: 1.2,
            }}
          >
            MailGenius
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: 0 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {/* Error / Success Alerts */}
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
        {success && (
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
            <span>{success}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
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

          <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (minimum 6 characters)"
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                id="input-password"
                style={{ paddingRight: '2.5rem', marginBottom: 0 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.2rem',
                  borderRadius: '4px',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                id="btn-toggle-password-visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                <Link
                  href="/forgot-password"
                  style={{
                    color: 'var(--accent)',
                    fontSize: '0.75rem',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </Link>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            id="btn-submit-credentials"
            style={{
              width: '100%',
              padding: '0.55rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              height: '38px',
              borderRadius: '7px',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: '14px', height: '14px' }} /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle Mode (Sign In / Sign Up) */}
        <p style={{ textAlign: 'center', marginTop: '0.75rem', marginBottom: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.8125rem',
              padding: 0,
            }}
            id="btn-toggle-mode"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {/* ── Guest Divider ─────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', margin: '0.875rem 0 0.625rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', textTransform: 'lowercase' }}>
            or try without an account
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
        </div>

        {/* Guest Login Button */}
        <button
          onClick={() => router.push('/generator')}
          id="btn-guest-login"
          disabled={loading}
          style={{
            width: '100%',
            height: '36px',
            padding: '0.5rem 0.875rem',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '7px',
            color: 'var(--text-muted)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            fontFamily: 'var(--font-ui)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.background = 'var(--accent-dim)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <User className="w-3.5 h-3.5" />
          Continue as Guest
        </button>

        <p
          style={{
            textAlign: 'center',
            marginTop: '0.375rem',
            marginBottom: 0,
            fontSize: '0.6875rem',
            color: 'var(--text-dim)',
            lineHeight: 1.35,
          }}
        >
          Guest mode: Generate replies freely. History &amp; saved templates require an account.
        </p>

        {/* ── Card Footer: MailGenius — Built by Aman Singh ── */}
        <div
          style={{
            marginTop: '0.875rem',
            paddingTop: '0.625rem',
            borderTop: '1px solid var(--border-light)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              margin: 0,
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>MailGenius</span>
            <span style={{ color: 'var(--text-dim)' }}>—</span>
            <span>Built by</span>
            <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>Aman Singh</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page"><div className="spinner" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
