'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import {
  Search,
  Menu,
  ChevronDown,
  User,
  FileText,
  KeyRound,
  Sliders,
  History,
  Bookmark,
  LogOut,
  LogIn,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export default function Topbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Close dropdown and mobile menu on route changes
  useEffect(() => {
    setProfileDropdownOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <>
      <header className="topbar-header">
        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          id="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5 text-[var(--text)]" />
        </button>

        {/* Global Search */}
        <div style={{ position: 'relative', flex: '1 1 auto', maxWidth: '360px' }}>
          <div style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }}>
            <Search className="w-4 h-4" />
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
              padding: '0.5rem 1rem 0.5rem 2.375rem',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              outline: 'none',
              color: 'var(--text)',
              transition: 'all 0.2s ease',
            }}
          />
        </div>

        {/* Right side controls: Light/Dark Theme Toggle + Admin Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginLeft: 'auto' }}>
          {/* Light / Dark Mode Toggle Button */}
          <ThemeToggle />

          {/* Admin Profile / Guest Profile */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            {user ? (
              /* Signed-in / Admin Profile Pill Trigger */
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                id="topbar-admin-profile-btn"
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.3125rem 0.625rem 0.3125rem 0.375rem',
                  background: profileDropdownOpen ? 'var(--surface-raised)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-ui)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={(e) => { if (!profileDropdownOpen) e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {/* Avatar with emerald online indicator */}
                <div style={{ position: 'relative', width: '30px', height: '30px' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: user.image ? 'transparent' : 'var(--accent-gradient)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {user.image ? (
                      <img src={user.image} alt={user.name || 'Admin'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#fff', fontSize: '0.6875rem', fontWeight: 700 }}>{initials}</span>
                    )}
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '1.5px solid var(--surface)',
                    }}
                  />
                </div>

                {/* Admin info text */}
                <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--text)',
                      maxWidth: '120px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.name || 'Admin'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: 'var(--accent-dim)',
                      color: 'var(--accent)',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '4px',
                      border: '1px solid var(--accent-border)',
                    }}
                  >
                    Admin
                  </span>
                </div>

                {/* Down chevron */}
                <ChevronDown
                  className="w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200"
                  style={{ transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
            ) : (
              /* Guest Profile Trigger */
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                id="topbar-guest-profile-btn"
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.3125rem 0.625rem 0.3125rem 0.375rem',
                  background: profileDropdownOpen ? 'var(--surface-raised)' : 'transparent',
                  border: '1px dashed var(--border)',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-ui)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={(e) => { if (!profileDropdownOpen) e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--surface-raised)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <User className="w-3.5 h-3.5" />
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Guest Mode</span>
                <ChevronDown
                  className="w-3.5 h-3.5 text-[var(--text-dim)] transition-transform duration-200"
                  style={{ transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
            )}

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div
                id="topbar-profile-dropdown"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '0.625rem',
                  minWidth: '270px',
                  zIndex: 60,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                  animation: 'fadeUp 0.15s ease both',
                }}
              >
                {user ? (
                  <>
                    {/* Admin Header with Photo, Name & Roles */}
                    <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.375rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: user.image ? 'transparent' : 'var(--accent-gradient)',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '1.5px solid var(--border)',
                          }}
                        >
                          {user.image ? (
                            <img src={user.image} alt={user.name || 'Admin'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 700 }}>{initials}</span>
                          )}
                        </div>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.name || 'Administrator'}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            padding: '0.125rem 0.375rem',
                            borderRadius: '4px',
                            background: 'var(--accent-dim)',
                            color: 'var(--accent)',
                            border: '1px solid var(--accent-border)',
                          }}
                        >
                          SUPER ADMIN
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: '#10B981', fontWeight: 600 }}>
                          Session Active 🟢
                        </span>
                      </div>
                    </div>

                    {/* Admin Action Menu */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                      <Link
                        href="/settings?tab=profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          color: 'var(--text)',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <User className="w-4 h-4 text-[var(--text-muted)]" />
                        Profile Update
                      </Link>

                      <Link
                        href="/settings?tab=security"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          color: 'var(--text)',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <ShieldCheck className="w-4 h-4 text-[var(--text-muted)]" />
                        User Details
                      </Link>

                      <Link
                        href="/settings?tab=security"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          color: 'var(--text)',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <KeyRound className="w-4 h-4 text-[var(--text-muted)]" />
                        Change Password
                      </Link>

                      <Link
                        href="/settings?tab=preferences"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          color: 'var(--text)',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Sliders className="w-4 h-4 text-[var(--text-muted)]" />
                        Settings &amp; Preferences
                      </Link>

                      <Link
                        href="/history"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          color: 'var(--text)',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <History className="w-4 h-4 text-[var(--text-muted)]" />
                        Reply History
                      </Link>

                      <Link
                        href="/saved"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          color: 'var(--text)',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Bookmark className="w-4 h-4 text-[var(--text-muted)]" />
                        Saved Templates
                      </Link>
                    </div>

                    <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.375rem 0' }} />

                    {/* Sign out */}
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut({ callbackUrl: '/login' });
                      }}
                      id="topbar-sign-out-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        color: 'var(--accent)',
                        fontSize: '0.875rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                        fontFamily: 'var(--font-ui)',
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-dim)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  /* Guest Dropdown with Read-Only options */
                  <>
                    <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>Guest Mode</p>
                        <span style={{ fontSize: '0.625rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '0.125rem 0.375rem', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Read-Only
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        You are in temporary guest mode. Profile edits and password changes require an account.
                      </p>
                    </div>

                    <Link
                      href="/login"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.8125rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In / Register
                    </Link>

                    {/* Guest Read-Only links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                      <Link
                        href="/settings#profile-section"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          fontSize: '0.8125rem',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User className="w-3.5 h-3.5" />
                          Profile Update
                        </span>
                        <span style={{ fontSize: '0.625rem', opacity: 0.6 }}>🔒 Read-Only</span>
                      </Link>

                      <Link
                        href="/settings#user-details-section"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          fontSize: '0.8125rem',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText className="w-3.5 h-3.5" />
                          User Details
                        </span>
                        <span style={{ fontSize: '0.625rem', opacity: 0.6 }}>🔒 Read-Only</span>
                      </Link>

                      <Link
                        href="/settings#password-section"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          fontSize: '0.8125rem',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <KeyRound className="w-3.5 h-3.5" />
                          Change Password
                        </span>
                        <span style={{ fontSize: '0.625rem', opacity: 0.6 }}>🔒 Read-Only</span>
                      </Link>

                      <Link
                        href="/settings#preferences-section"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          fontSize: '0.8125rem',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-raised)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Sliders className="w-3.5 h-3.5" />
                          Settings
                        </span>
                        <span style={{ fontSize: '0.625rem', opacity: 0.6 }}>🔒 Read-Only</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '68px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--surface)',
            zIndex: 45,
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            overflowY: 'auto',
          }}
        >
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>Dashboard</Link>
          <Link href="/generator" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>Generate Reply</Link>
          <Link href="/history" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>History</Link>
          <Link href="/saved" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>Saved</Link>
          <Link href="/settings" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>Settings &amp; Profile</Link>
          <Link href="/how-to-use" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>How to Use</Link>
          <Link href="/about" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>About</Link>
          
          <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />
          
          {user ? (
            <button
              onClick={() => {
                setMenuOpen(false);
                signOut({ callbackUrl: '/login' });
              }}
              style={{
                fontSize: '1.125rem',
                color: 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-ui)',
                padding: 0,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: '1.125rem',
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <LogIn className="w-5 h-5" />
              Exit Guest Mode / Sign In
            </Link>
          )}
        </div>
      )}
    </>
  );
}
