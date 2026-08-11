import Link from 'next/link';
import Postmark from '@/components/Postmark';
import QuickGenerate from './QuickGenerate';
import connectDB from '@/lib/mongodb';
import EmailHistory from '@/lib/models/EmailHistory';
import Template from '@/lib/models/Template';

export const metadata = {
  title: 'Dashboard — MailGenius',
  description: 'View your AI email reply statistics and recent activity.',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function truncate(text, max = 180) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}

export default async function DashboardPage() {
  let stats = { totalReplies: 0, mostRecent: null, recentActivity: [], savedReplies: 0, repliesThisWeek: 0 };
  let dbError = null;
  
  try {
    await connectDB();
    stats.totalReplies = await EmailHistory.countDocuments();
    stats.savedReplies = await Template.countDocuments();
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    stats.repliesThisWeek = await EmailHistory.countDocuments({ created_at: { $gte: sevenDaysAgo } });

    const recent = await EmailHistory.find({})
      .sort({ created_at: -1 })
      .limit(3)
      .lean();
    
    stats.mostRecent = recent[0] ? {
      ...recent[0],
      _id: recent[0]._id.toString(),
      created_at: recent[0].created_at?.toISOString() ?? null,
    } : null;
    
    stats.recentActivity = recent.map(r => ({
      ...r,
      _id: r._id.toString(),
      created_at: r.created_at?.toISOString() ?? null,
    }));
  } catch {
    dbError = 'Could not connect to the database. Please check your MONGODB_URI.';
  }

  const avgTimeSaved = (stats.totalReplies * 6) / 60; // 6 mins per reply

  return (
    <div className="page-wrap" style={{ maxWidth: '1200px' }}>
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="display-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '2rem' }}>
            Welcome back! <span style={{ fontSize: '1.75rem' }}>👋</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Write better emails in seconds with AI.
          </p>
        </div>
        <Link href="/generator" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Generate New Reply
        </Link>
      </div>

      {dbError && (
        <div className="alert-error" style={{ marginBottom: '2rem' }}>
          <span>—</span>
          <span>{dbError}</span>
        </div>
      )}

      {/* ── STATS ROW ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Card 1 */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 44, 57, 0.08)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, fontFamily: 'var(--font-display)' }}>{stats.totalReplies}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Replies Generated</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 44, 57, 0.08)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, fontFamily: 'var(--font-display)' }}>{stats.savedReplies}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Saved Replies</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 44, 57, 0.08)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, fontFamily: 'var(--font-display)' }}>{stats.repliesThisWeek}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Replies This Week</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139, 44, 57, 0.08)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, fontFamily: 'var(--font-display)' }}>{avgTimeSaved.toFixed(1)}h</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Avg. Time Saved</div>
          </div>
        </div>

      </div>

      {/* ── MIDDLE ROW ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Quick Generate Component */}
        <QuickGenerate />

        {/* Recent Reply Card */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)' }}>Recent Reply</h2>
            <Link href="/history" className="btn-ghost" style={{ fontSize: '0.8125rem', color: 'var(--accent)' }}>
              View all history <span aria-hidden="true">→</span>
            </Link>
          </div>

          {stats.mostRecent ? (
            <>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139, 44, 57, 0.08)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.25rem' }}>Reply Generated</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Postmark tone={stats.mostRecent.tone} size="sm" />
                    <span>•</span>
                    <span>{formatDate(stats.mostRecent.created_at)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text)' }}>Original Email</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, background: 'var(--bg)', padding: '0.75rem', borderRadius: '6px' }}>
                  {truncate(stats.mostRecent.original_email, 150)}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--accent)' }}>AI Generated Reply</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {truncate(stats.mostRecent.generated_reply, 200)}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  Copy Reply
                </button>
                <Link href="/history" className="btn-ghost" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                  View Full
                </Link>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Use This Reply
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>
              No replies generated yet.
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW (Recent Activity Table) ─────────────────── */}
      <div className="surface" style={{ padding: '1.5rem', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)' }}>Recent Activity</h2>
          <Link href="/history" className="btn-ghost" style={{ fontSize: '0.8125rem', color: 'var(--accent)' }}>
            View all <span aria-hidden="true">→</span>
          </Link>
        </div>

        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
              <div>Subject</div>
              <div>Tone</div>
              <div>Generated</div>
            </div>
            
            {stats.recentActivity.map((activity, i) => (
              <div key={activity._id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', alignItems: 'center', padding: '1rem 0', borderBottom: i !== stats.recentActivity.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(139, 44, 57, 0.08)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  {truncate(activity.original_email, 40) || 'Reply Generated'}
                </div>
                <div>
                  <Postmark tone={activity.tone} size="sm" />
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {formatDate(activity.created_at)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.875rem' }}>
            No recent activity found.
          </div>
        )}
      </div>

    </div>
  );
}
