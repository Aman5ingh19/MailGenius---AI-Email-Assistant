export default function SavedLoading() {
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
        <div className="shimmer" style={{ height: '2rem', width: '220px', marginBottom: '0.5rem', borderRadius: '10px' }} />
        <div className="shimmer" style={{ height: '0.9rem', width: '260px', borderRadius: '6px' }} />
      </div>

      {/* Template cards grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div className="shimmer" style={{ height: '1rem', width: '60%', borderRadius: '4px' }} />
              <div className="shimmer" style={{ height: '1.5rem', width: '60px', borderRadius: '20px' }} />
            </div>
            <div className="shimmer" style={{ height: '4rem', width: '100%', marginBottom: '1rem', borderRadius: '6px' }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div className="shimmer" style={{ height: '2rem', flex: 1, borderRadius: '8px' }} />
              <div className="shimmer" style={{ height: '2rem', flex: 1, borderRadius: '8px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
