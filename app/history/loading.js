export default function HistoryLoading() {
  return (
    <div className="page-wrap">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg,
            var(--surface-raised) 25%,
            var(--surface) 50%,
            var(--surface-raised) 75%
          );
          background-size: 800px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 8px;
        }
      `}</style>

      <div style={{ marginBottom: '2rem' }}>
        <div className="shimmer" style={{ height: '2rem', width: '200px', marginBottom: '0.5rem', borderRadius: '10px' }} />
        <div className="shimmer" style={{ height: '0.9rem', width: '280px', borderRadius: '6px' }} />
      </div>

      {/* Search bar skeleton */}
      <div className="shimmer" style={{ height: '3rem', width: '100%', marginBottom: '1.5rem', borderRadius: '10px' }} />

      {/* Reply cards skeleton */}
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '0.75rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}>
          <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="shimmer" style={{ height: '0.9rem', width: '60%', marginBottom: '0.5rem', borderRadius: '4px' }} />
            <div className="shimmer" style={{ height: '0.75rem', width: '40%', marginBottom: '0.75rem', borderRadius: '4px' }} />
            <div className="shimmer" style={{ height: '3.5rem', width: '100%', borderRadius: '6px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
