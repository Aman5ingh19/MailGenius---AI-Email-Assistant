export default function DashboardLoading() {
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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="shimmer" style={{ height: '2rem', width: '300px', marginBottom: '0.5rem', borderRadius: '10px' }} />
          <div className="shimmer" style={{ height: '0.9rem', width: '220px', borderRadius: '6px' }} />
        </div>
        <div className="shimmer" style={{ height: '2.5rem', width: '170px', borderRadius: '10px' }} />
      </div>

      {/* Stat cards */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            background: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}>
            <div className="shimmer" style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="shimmer" style={{ height: '1.6rem', width: '60px', marginBottom: '0.4rem', borderRadius: '6px' }} />
              <div className="shimmer" style={{ height: '0.8rem', width: '100px', borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="dashboard-middle" style={{ marginBottom: '2rem' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.75rem' }}>
          <div className="shimmer" style={{ height: '1.1rem', width: '160px', marginBottom: '1.25rem', borderRadius: '6px' }} />
          <div className="shimmer" style={{ height: '2.5rem', width: '100%', marginBottom: '0.75rem', borderRadius: '8px' }} />
          <div className="shimmer" style={{ height: '8rem', width: '100%', borderRadius: '8px' }} />
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div className="shimmer" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
          <div className="shimmer" style={{ height: '1rem', width: '120px', borderRadius: '6px' }} />
          <div className="shimmer" style={{ height: '0.8rem', width: '200px', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Activity table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.75rem' }}>
        <div className="shimmer" style={{ height: '1.1rem', width: '150px', marginBottom: '1.25rem', borderRadius: '6px' }} />
        {[1,2,3].map(i => (
          <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
            <div className="shimmer" style={{ width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0 }} />
            <div className="shimmer" style={{ height: '0.875rem', flex: 1, borderRadius: '4px' }} />
            <div className="shimmer" style={{ height: '0.875rem', width: '80px', borderRadius: '4px' }} />
            <div className="shimmer" style={{ height: '0.875rem', width: '100px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
