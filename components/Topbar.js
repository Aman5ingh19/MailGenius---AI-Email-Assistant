'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

export default function Topbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (query.trim()) {
        router.push(`/history?q=${encodeURIComponent(query.trim())}`);
      } else {
        router.push('/history');
      }
    }
  };

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
      <header className="topbar-header">
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} id="mobile-menu-toggle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 auto', maxWidth: '360px' }}>
          <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            placeholder="Search replies... (Press Enter)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            id="topbar-search"
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.25rem',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              outline: 'none',
              color: 'var(--text)',
              transition: 'border-color 0.15s ease',
            }}
          />
        </div>

        {/* Right side: theme toggle + user avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          <ThemeToggle />

          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                id="user-avatar-btn"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: user.image ? 'transparent' : 'var(--accent)',
                  border: '2px solid var(--border)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  padding: 0,
                }}
                aria-label="User menu"
              >
                {user.image ? (
                  <img src={user.image} alt={user.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{initials}</span>
                )}
              </button>

              {/* Dropdown */}
              {avatarOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 39 }}
                    onClick={() => setAvatarOpen(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '0.5rem',
                    minWidth: '200px',
                    zIndex: 40,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  }}>
                    <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.375rem' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.125rem' }}>{user.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                    <Link
                      href="/settings"
                      onClick={() => setAvatarOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-raised)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                      Settings
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      id="btn-sign-out"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', color: 'var(--accent)', fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'var(--font-ui)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: '72px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--surface)',
          zIndex: 45,
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
          <Link href="/inbox" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Inbox</Link>
          <Link href="/generator" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Generator</Link>
          <Link href="/history" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>History</Link>
          <Link href="/saved" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Saved</Link>
          {user && (
            <button onClick={() => signOut({ callbackUrl: '/login' })} style={{ fontSize: '1.125rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-ui)', padding: 0 }}>
              Sign Out
            </button>
          )}
        </div>
      )}
    </>
  );
}
