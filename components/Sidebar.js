'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
  },
  {
    href: '/generator',
    label: 'Generate Reply',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
  },
  {
    href: '/history',
    label: 'History',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
  },
  {
    href: '/saved',
    label: 'Saved',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
  },
];

const secondaryLinks = [
  {
    href: '/settings',
    label: 'Settings',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
  },
  {
    href: '/support',
    label: 'Help & Support',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
  }
];

export default function Sidebar() {
  const pathname = usePathname();

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
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
        {navLinks.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9375rem',
                transition: 'all 0.2s ease'
              }}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div style={{ height: '1px', background: 'var(--border-light)', margin: '0 1rem 1.5rem 1rem' }} />

      {/* Secondary Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {secondaryLinks.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.9375rem',
            }}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Pro Card */}
      <div style={{ padding: '1.25rem', background: 'var(--accent-dim)', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <div style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" /></svg>
        </div>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.375rem' }}>Upgrade to Pro</h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.4 }}>
          Unlock advanced tones, templates and more AI power.
        </p>
        <button style={{ width: '100%', padding: '0.625rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
          Upgrade Now
        </button>
      </div>

    </aside>
  );
}
