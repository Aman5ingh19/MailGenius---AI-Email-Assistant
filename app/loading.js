export default function GlobalLoading() {
  return (
    <div className="page-wrap" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skel {
          background: var(--surface-raised);
          border-radius: 8px;
        }
      `}</style>

      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div className="skel" style={{ height: '2rem', width: '280px', marginBottom: '0.5rem' }} />
          <div className="skel" style={{ height: '1rem', width: '200px' }} />
        </div>
        <div className="skel" style={{ height: '2.5rem', width: '160px', borderRadius: '10px' }} />
      </div>

      {/* Stats row skeleton */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="surface skel" style={{ padding: '1.5rem', borderRadius: '12px', height: '90px' }} />
        ))}
      </div>

      {/* Content row skeleton */}
      <div className="dashboard-middle">
        <div className="surface skel" style={{ borderRadius: '14px', height: '320px' }} />
        <div className="surface skel" style={{ borderRadius: '14px', height: '320px' }} />
      </div>
    </div>
  );
}
