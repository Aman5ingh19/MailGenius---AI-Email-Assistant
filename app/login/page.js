'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Send,
} from 'lucide-react';

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
      {/* ── Background Decorative Vector Layer ── */}
      <div className="auth-bg-decor" aria-hidden="true">
        {/* Ambient SVG Flowing Waves & Bottom-Left Concentric Arcs */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bottom Left Gradient Waves */}
          <circle cx="2%" cy="98%" r="480" fill="var(--auth-wave-1, rgba(224, 242, 254, 0.45))" />
          <circle cx="2%" cy="98%" r="320" fill="var(--auth-wave-2, rgba(186, 230, 253, 0.35))" />
          <circle cx="2%" cy="98%" r="180" fill="var(--auth-wave-3, rgba(147, 197, 253, 0.25))" />

          {/* Flowing Light Curved Lines across background */}
          <path
            d="M-50,220 C200,160 350,380 650,280 C950,180 1100,420 1450,320"
            fill="none"
            stroke="var(--auth-line-1, rgba(186, 230, 253, 0.45))"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path
            d="M-50,380 C250,300 400,520 750,440 C1100,360 1200,560 1550,460"
            fill="none"
            stroke="var(--auth-line-2, rgba(191, 219, 254, 0.35))"
            strokeWidth="1.2"
          />
        </svg>

        {/* Soft 3D Circular Floating Orbs */}
        <div
          className="auth-floating-orb"
          style={{ top: '14%', right: '16%', width: '70px', height: '70px', opacity: 0.85 }}
        />
        <div
          className="auth-floating-orb"
          style={{ top: '48%', right: '8%', width: '110px', height: '110px', opacity: 0.65 }}
        />

        {/* Left Floating Translucent Envelope Card */}
        <div
          className="auth-floating-badge"
          style={{ top: '42%', left: '8%', transform: 'rotate(-4deg)' }}
        >
          <Mail className="w-5 h-5" />
        </div>

        {/* Right Floating Translucent Envelope Card */}
        <div
          className="auth-floating-badge"
          style={{ bottom: '26%', right: '9%', transform: 'rotate(5deg)' }}
        >
          <Mail className="w-5 h-5" />
        </div>

        {/* Bottom Right Paper Airplane */}
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
            right: '18%',
            color: 'var(--accent)',
            transform: 'rotate(-25deg)',
            opacity: 0.7,
          }}
        >
          <Send className="w-6 h-6" />
        </div>

        {/* 4-Point Sparkle Stars */}
        <div style={{ position: 'absolute', top: '18%', left: '18%', color: 'var(--accent)', opacity: 0.75 }}>
          <Sparkles className="w-4 h-4" />
        </div>
        <div style={{ position: 'absolute', top: '56%', right: '19%', color: 'var(--accent)', opacity: 0.75 }}>
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Dot Matrix Grids */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: '6%',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 4px)',
            gap: '8px',
            opacity: 0.35,
          }}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={`dtl-${i}`} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }} />
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '24%',
            left: '3%',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 4px)',
            gap: '8px',
            opacity: 0.3,
          }}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={`dbl-${i}`} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }} />
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            top: '6%',
            right: '7%',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 4px)',
            gap: '8px',
            opacity: 0.3,
          }}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={`dtr-${i}`} style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }} />
          ))}
        </div>
      </div>

      {/* ── Main Auth Card (Clean, Compact, High-Contrast in Light & Dark Mode) ── */}
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
              fontSize: '1.4rem',
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

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {mode === 'signup' && (
            <div className="auth-input-wrapper">
              <User className="w-4 h-4 auth-input-icon" />
              <input
                className="auth-input"
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={mode === 'signup'}
                id="input-name"
              />
            </div>
          )}

          {/* Email input with left icon */}
          <div className="auth-input-wrapper">
            <Mail className="w-4 h-4 auth-input-icon" />
            <input
              className="auth-input"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              id="input-email"
            />
          </div>

          {/* Password input with left lock and right eye toggle */}
          <div className="auth-input-wrapper" style={{ marginBottom: '0.875rem' }}>
            <div style={{ position: 'relative' }}>
              <Lock className="w-4 h-4 auth-input-icon" />
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (minimum 6 characters)"
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                id="input-password"
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
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.2rem',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                id="btn-toggle-password-visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: '0.35rem' }}>
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

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            id="btn-submit-credentials"
            style={{
              width: '100%',
              height: '38px',
              padding: '0.55rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '8px',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
            }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: '14px', height: '14px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
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
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
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
            e.currentTarget.style.color = 'var(--text)';
            e.currentTarget.style.background = 'var(--surface-raised)';
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
