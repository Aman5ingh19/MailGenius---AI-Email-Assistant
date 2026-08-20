'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, User, Mail, Lock, LogIn, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

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
      {/* Decorative ambient background glowing elements */}
      <div className="auth-bg-glow-1" />
      <div className="auth-bg-glow-2" />
      <div className="auth-bg-grid" />

      {/* Main Auth Card */}
      <div className="auth-card" style={{ position: 'relative', zIndex: 10 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', background: 'var(--accent-dim)', color: 'var(--accent)', marginBottom: '1rem', border: '1px solid var(--accent-border)' }}>
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.625rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
            MailGenius
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {/* Error/Success alerts */}
        {error && (
          <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert-success" style={{ marginBottom: '1.25rem' }}>
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Credentials form */}
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
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
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
                style={{ paddingRight: '2.75rem', marginBottom: '0.25rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '40%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem',
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
                <Link href="/forgot-password" style={{ color: 'var(--accent)', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 500 }}>
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
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', justifyContent: 'center' }}
          >
            {loading ? (
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
          disabled={loading}
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
          <User className="w-4 h-4" />
          Continue as Guest
        </button>
        <p style={{ textAlign: 'center', marginTop: '0.625rem', fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Guest mode: Generate replies freely. History &amp; saved templates require an account.
        </p>

        {/* ── Card Footer: MailGenius — Built by Aman Singh ── */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
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
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
