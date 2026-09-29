export default function GeneratorLoading() {
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

      <div style={{ marginBottom: '1.5rem' }}>
        <div className="shimmer" style={{ height: '2rem', width: '250px', marginBottom: '0.5rem', borderRadius: '10px' }} />
        <div className="shimmer" style={{ height: '0.9rem', width: '320px', borderRadius: '6px' }} />
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
        {/* Input panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem' }}>
          <div className="shimmer" style={{ height: '1rem', width: '140px', marginBottom: '1rem', borderRadius: '4px' }} />
          <div className="shimmer" style={{ height: '12rem', width: '100%', marginBottom: '1rem', borderRadius: '10px' }} />
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="shimmer" style={{ height: '2.5rem', width: '120px', borderRadius: '8px' }} />
            <div className="shimmer" style={{ height: '2.5rem', flex: 1, borderRadius: '8px' }} />
          </div>
          <div className="shimmer" style={{ height: '3rem', width: '100%', borderRadius: '10px' }} />
        </div>
        {/* Output panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.75rem' }}>
          <div className="shimmer" style={{ height: '1rem', width: '140px', marginBottom: '1rem', borderRadius: '4px' }} />
          <div className="shimmer" style={{ height: '16rem', width: '100%', borderRadius: '10px' }} />
        </div>
      </div>
    </div>
  );
}
