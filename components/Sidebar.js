'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Sparkles,
  LayoutDashboard,
  Send,
  History,
  Bookmark,
  Settings,
  HelpCircle,
  Info,
  LogOut,
  LogIn,
  Lock,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresAuth: false },
  { href: '/generator', label: 'Generate Reply', icon: Send, requiresAuth: false },
  { href: '/history',   label: 'History',        icon: History, requiresAuth: true  },
  { href: '/saved',     label: 'Saved',          icon: Bookmark, requiresAuth: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isGuest = !session?.user;

  return (
    <aside className="desktop-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* ── Brand Header ────────────────────────────────────────────── */}
      <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: 'var(--accent-glow)',
              flexShrink: 0,
            }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.25rem',
                letterSpacing: '-0.03em',
                color: 'var(--text)',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              MailGenius
            </span>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              AI Email Assistant
            </span>
          </div>
        </Link>
      </div>

      {/* ── Main Navigation Links ──────────────────────────────────── */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.75rem 0.25rem' }}>
          Menu
        </div>

        {NAV_ITEMS.map(({ href, label, icon: Icon, requiresAuth }) => {
          const isActive = pathname === href;
          const isLocked = isGuest && requiresAuth;

          return (
            <Link
              key={href}
              href={href}
              id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--accent)' : isLocked ? 'var(--text-dim)' : 'var(--text)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--surface-raised)';
                  e.currentTarget.style.color = 'var(--text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = isLocked ? 'var(--text-dim)' : 'var(--text)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent)]' : 'text-current'}`} />
                <span>{label}</span>
              </div>
              {isLocked && <Lock className="w-3.5 h-3.5 text-[var(--text-dim)] opacity-60" />}
            </Link>
          );
        })}

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.75rem 0' }} />

        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.75rem 0.25rem' }}>
          Preferences &amp; Help
        </div>

        {/* Settings Navigation Link */}
        <Link
          href="/settings"
          id="nav-settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0.875rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: pathname === '/settings' ? 600 : 500,
            color: pathname === '/settings' ? 'var(--accent)' : 'var(--text)',
            background: pathname === '/settings' ? 'var(--accent-dim)' : 'transparent',
            border: pathname === '/settings' ? '1px solid var(--accent-border)' : '1px solid transparent',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/settings') e.currentTarget.style.background = 'var(--surface-raised)';
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/settings') e.currentTarget.style.background = 'transparent';
          }}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>

        {/* How to Use Direct Link */}
        <Link
          href="/how-to-use"
          id="nav-how-to-use"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0.875rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: pathname === '/how-to-use' ? 600 : 500,
            color: pathname === '/how-to-use' ? 'var(--accent)' : 'var(--text)',
            background: pathname === '/how-to-use' ? 'var(--accent-dim)' : 'transparent',
            border: pathname === '/how-to-use' ? '1px solid var(--accent-border)' : '1px solid transparent',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/how-to-use') e.currentTarget.style.background = 'var(--surface-raised)';
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/how-to-use') e.currentTarget.style.background = 'transparent';
          }}
        >
          <HelpCircle className="w-4 h-4" />
          <span>How to Use</span>
        </Link>

        {/* About Direct Link */}
        <Link
          href="/about"
          id="nav-about"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0.875rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: pathname === '/about' ? 600 : 500,
            color: pathname === '/about' ? 'var(--accent)' : 'var(--text)',
            background: pathname === '/about' ? 'var(--accent-dim)' : 'transparent',
            border: pathname === '/about' ? '1px solid var(--accent-border)' : '1px solid transparent',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/about') e.currentTarget.style.background = 'var(--surface-raised)';
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/about') e.currentTarget.style.background = 'transparent';
          }}
        >
          <Info className="w-4 h-4" />
          <span>About</span>
        </Link>
      </nav>

      {/* ── Bottom Section: Sign Out or Exit Guest Mode ────────────── */}
      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)', marginTop: 'auto' }}>
        {session?.user ? (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            id="sidebar-sign-out-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              width: '100%',
              padding: '0.625rem 1rem',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--accent)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-dim)';
              e.currentTarget.style.borderColor = 'var(--accent-border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <Link
            href="/login"
            id="sidebar-exit-guest-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              width: '100%',
              padding: '0.625rem 1rem',
              background: 'var(--accent-gradient)',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(37, 99, 235, 0.25)';
            }}
          >
            <LogIn className="w-4 h-4" />
            <span>Exit Guest Mode</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
