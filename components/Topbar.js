'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Topbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (query.trim()) {
        router.push(`/history?q=${encodeURIComponent(query.trim())}`);
      } else {
        router.push('/history');
      }
    }
  };

  return (
    <>
      <header className="topbar-header">
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div style={{ position: 'relative', width: '300px', flex: '1 1 auto', maxWidth: '300px' }}>
        <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <input 
          type="text" 
          placeholder="Search replies... (Press Enter)" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          style={{
            width: '100%',
            padding: '0.5rem 1rem 0.5rem 2.25rem',
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '0.875rem',
            outline: 'none',
            color: 'var(--text)'
          }}
        />
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
          gap: '1.5rem'
        }}>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
          <Link href="/generator" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Generator</Link>
          <Link href="/history" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>History</Link>
          <Link href="/saved" onClick={() => setMenuOpen(false)} style={{ fontSize: '1.125rem', color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Saved</Link>
        </div>
      )}
    </>
  );
}
