'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Lock, X, LogIn } from 'lucide-react';

/**
 * GuestToast — client component
 * Shows a toast when a guest user tries to access a protected page.
 * Triggered by ?guest_blocked=<page> query param on /dashboard.
 */
export default function GuestToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [blocked, setBlocked] = useState('');

  useEffect(() => {
    const param = searchParams.get('guest_blocked');
    if (param) {
      setBlocked(param); // 'history' | 'saved'
      setVisible(true);

      // Auto-hide after 5s
      const timer = setTimeout(() => {
        setVisible(false);
        // Clean the URL param without re-navigating
        const url = new URL(window.location.href);
        url.searchParams.delete('guest_blocked');
        window.history.replaceState({}, '', url.pathname + url.search);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleClose = () => {
    setVisible(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('guest_blocked');
    window.history.replaceState({}, '', url.pathname + url.search);
  };

  const pageLabel = blocked === 'saved' ? 'Saved Templates' : 'History';

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        maxWidth: '380px',
        width: 'calc(100vw - 2.5rem)',
        background: 'linear-gradient(135deg, #1e1b2e 0%, #16131f 100%)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(168,85,247,0.1)',
        display: 'flex',
        gap: '0.875rem',
        alignItems: 'flex-start',
        animation: 'slideInRight 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(60px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1); }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(139,92,246,0.15))',
        border: '1px solid rgba(168,85,247,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#a855f7',
      }}>
        <Lock size={17} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#f0eaff', lineHeight: 1.3 }}>
          🔒 Guest Mode — Access Restricted
        </p>
        <p style={{ margin: '0.3rem 0 0.75rem', fontSize: '0.8rem', color: 'rgba(200,190,220,0.8)', lineHeight: 1.5 }}>
          <strong style={{ color: '#c084fc' }}>{pageLabel}</strong> is only available for logged-in users.
          Sign up or log in to unlock your full email history.
        </p>
        <a
          href="/login"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.4rem 0.875rem', borderRadius: '8px', fontSize: '0.78rem',
            fontWeight: 600, textDecoration: 'none', color: '#fff',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            border: '1px solid rgba(168,85,247,0.5)',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <LogIn size={13} /> Sign In
        </a>
      </div>

      {/* Close */}
      <button
        onClick={handleClose}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
          color: 'rgba(180,160,210,0.6)', borderRadius: '6px', lineHeight: 1,
          flexShrink: 0, marginTop: '1px',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#f0eaff'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(180,160,210,0.6)'}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
