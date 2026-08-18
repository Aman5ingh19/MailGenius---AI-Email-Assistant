'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const navLinks = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    protected: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
  },

  {
    href: '/generator',
    label: 'Generate Reply',
    protected: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
  },
  {
    href: '/history',
    label: 'History',
    protected: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  },
  {
    href: '/saved',
    label: 'Saved',
    protected: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
  },
];

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45, flexShrink: 0 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

// Collapsible sidebar item
function CollapseItem({ label, icon, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        id={`sidebar-${label.toLowerCase().replace(/\s+/g, '-')}`}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.6875rem 1rem',
          borderRadius: '8px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          fontWeight: 500,
          fontSize: '0.9375rem',
          cursor: 'pointer',
          fontFamily: 'var(--font-ui)',
          transition: 'background 0.15s ease',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        aria-expanded={open}
      >
        {icon}
        <span style={{ flex: 1 }}>{label}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Collapsible panel */}
      <div style={{
        overflow: 'hidden',
        maxHeight: open ? '500px' : '0',
        transition: 'max-height 0.3s ease',
      }}>
        <div style={{
          margin: '0.25rem 0.5rem 0.75rem 0.5rem',
          padding: '1rem',
          background: 'var(--surface-raised)',
          borderRadius: '8px',
          border: '1px solid var(--border-light)',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside className="desktop-sidebar">
      {/* Brand */}
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '2.5rem' }}>
        <div style={{ color: 'var(--accent)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" /></svg>
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', lineHeight: 1 }}>
            MailGenius
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
            AI Email Assistant
          </p>
        </div>
      </Link>

      {/* Main Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '2rem' }}>
        {navLinks.map(({ href, label, icon, protected: isProtected }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          const isLocked = isProtected && !user;
          return (
            <Link
              key={href}
              href={isLocked ? '/login' : href}
              title={isLocked ? 'Sign in to access ' + label : label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6875rem 1rem',
                borderRadius: '8px',
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#fff' : isLocked ? 'var(--text-dim)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9375rem',
                transition: 'all 0.15s ease',
                opacity: isLocked ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-raised)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {icon}
              <span style={{ flex: 1 }}>{label}</span>
              {isLocked && <LockIcon />}
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div style={{ height: '1px', background: 'var(--border-light)', margin: '0 0.5rem 1.5rem 0.5rem' }} />

      {/* Secondary Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.5rem' }}>
        <Link
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.6875rem 1rem', borderRadius: '8px',
            color: pathname === '/settings' ? 'var(--accent)' : 'var(--text-muted)',
            textDecoration: 'none', fontWeight: 500, fontSize: '0.9375rem',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          Settings
        </Link>

        {/* About MailGenius — collapsible */}
        <CollapseItem
          label="About"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          }
        >
          <p style={{ marginBottom: '0.625rem', fontWeight: 600, color: 'var(--text)', fontSize: '0.8125rem' }}>About MailGenius</p>
          <p style={{ marginBottom: '0.625rem' }}>
            An advanced AI-powered email assistant that helps you write professional, concise, and persuasive emails in seconds.
          </p>
          <ul style={{ paddingLeft: '1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>Powered by Google Gemini 1.5 Flash AI</li>
            <li>Real-time SSE streaming generation</li>
            <li>Secure auth & isolated user data</li>
          </ul>
        </CollapseItem>

        {/* How to Use — collapsible */}
        <CollapseItem
          label="How to Use"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          }
        >
          <p style={{ marginBottom: '0.625rem', fontWeight: 600, color: 'var(--text)', fontSize: '0.8125rem' }}>How to Use</p>
          <ol style={{ paddingLeft: '1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <li><strong style={{ color: 'var(--text)' }}>Generate:</strong> Paste an email or upload .txt/.eml, pick a tone, and hit generate.</li>
            <li><strong style={{ color: 'var(--text)' }}>Live Stream:</strong> Use the "Live Stream" tab to watch AI type in real-time.</li>
            <li><strong style={{ color: 'var(--text)' }}>Quick Replies:</strong> Click "Quick Replies" for instant 1-click suggestions.</li>
            <li><strong style={{ color: 'var(--text)' }}>Save & History:</strong> Save templates or browse your full reply archive.</li>
          </ol>
        </CollapseItem>
      </nav>

      <div style={{ flex: 1 }} />

      {/* User Profile Card — authenticated */}
      {user ? (
        <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: user.image ? 'transparent' : 'var(--accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {user.image ? (
                <img src={user.image} alt={user.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{initials}</span>
              )}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name || 'User'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            id="sidebar-sign-out"
            style={{ width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'var(--font-ui)', transition: 'all 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      ) : (
        /* Guest User Card */
        <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px dashed var(--border)', marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-dim)' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>Guest User</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Not signed in</p>
            </div>
          </div>
          <Link
            href="/login"
            id="sidebar-sign-in"
            style={{ width: '100%', padding: '0.5rem', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '0.8125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'var(--font-ui)', textDecoration: 'none', fontWeight: 600 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Sign In / Sign Up
          </Link>
        </div>
      )}
    </aside>
  );
}
