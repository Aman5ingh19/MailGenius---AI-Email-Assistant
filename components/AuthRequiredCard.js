import Link from 'next/link';
import { Lock, Sparkles, UserPlus, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AuthRequiredCard({
  title = 'Authentication Required',
  description = 'This section is strictly restricted to authenticated users. Please sign in or create an account to unlock your personal vault and history.',
  feature = 'this feature',
}) {
  return (
    <div className="page-wrap" style={{ maxWidth: '680px', margin: '3rem auto', padding: '0 1rem' }}>
      <div
        className="surface"
        style={{
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-raised) 100%)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <Lock className="w-8 h-8" />
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#EF4444',
            background: 'rgba(239, 68, 68, 0.08)',
            padding: '0.25rem 0.75rem',
            borderRadius: '999px',
            marginBottom: '1rem',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          Access Restricted
        </span>

        <h1
          className="display-title"
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: 'var(--text)',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            maxWidth: '480px',
            marginBottom: '2rem',
          }}
        >
          {description}
        </p>

        <div
          style={{
            display: 'flex',
            gap: '0.875rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <Link
            href="/login"
            className="btn-primary"
            style={{
              flex: 1,
              minWidth: '160px',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9375rem',
            }}
          >
            <UserPlus className="w-4 h-4" />
            Sign In / Register
          </Link>
          <Link
            href="/generator"
            className="btn-ghost"
            style={{
              flex: 1,
              minWidth: '160px',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.9375rem',
            }}
          >
            <Sparkles className="w-4 h-4" />
            Try Generator
          </Link>
        </div>
      </div>
    </div>
  );
}
