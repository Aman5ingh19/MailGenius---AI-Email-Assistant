'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Topbar() {
  const [query, setQuery] = useState('');
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
    <header style={{
      height: '72px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ position: 'relative', width: '300px' }}>
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
  );
}
