import Link from 'next/link';
import Postmark from '@/components/Postmark';
import QuickGenerate from './QuickGenerate';
import connectDB from '@/lib/mongodb';
import EmailHistory from '@/lib/models/EmailHistory';
import Template from '@/lib/models/Template';
import { auth } from '@/auth';
import {
  Sparkles,
  Plus,
  Mail,
  BookmarkCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  Copy,
  ExternalLink,
  Check,
  Lock,
  User,
} from 'lucide-react';

export const metadata = {
  title: 'Dashboard — 📧 MailGenius',
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
  const session = await auth();
  const userId = session?.user?.id || null;
  const userName = session?.user?.name || null;

  let stats = { totalReplies: 0, mostRecent: null, recentActivity: [], savedReplies: 0, repliesThisWeek: 0 };
  let dbError = null;

  if (userId) {
    try {
      await connectDB();
      const query = { userId };

      stats.totalReplies = await EmailHistory.countDocuments(query);
      stats.savedReplies = await Template.countDocuments({ userId });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      stats.repliesThisWeek = await EmailHistory.countDocuments({ ...query, created_at: { $gte: sevenDaysAgo } });

      const recent = await EmailHistory.find(query)
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
  }

  const avgTimeSaved = (stats.totalReplies * 6) / 60; // 6 mins per reply

  return (
    <div className="page-wrap">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="display-title" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem', fontSize: '2rem' }}>
            Welcome back{userName ? `, ${userName.split(' ')[0]}` : ''}! <span style={{ fontSize: '1.75rem' }}>👋</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Transform messy inbox threads into executive-ready replies in seconds.
          </p>
        </div>
        <Link href="/generator" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}>
          <Sparkles className="w-4 h-4" />
          Generate New Reply
        </Link>
      </div>

      {dbError && (
        <div className="alert-error" style={{ marginBottom: '2rem' }}>
          <span>{dbError}</span>
        </div>
      )}

      {/* ── STATS ROW ──────────────────────────────────────────── */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        {/* Card 1 */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>{stats.totalReplies}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Replies Generated</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>{stats.savedReplies}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Saved Templates</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>{stats.repliesThisWeek}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Replies This Week</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="surface" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(217, 119, 6, 0.12)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>{avgTimeSaved.toFixed(1)}h</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Avg. Time Saved</div>
          </div>
        </div>
      </div>

      {/* ── MAIN ROW ───────────────────────────────────────────── */}
      <div className="dashboard-middle">
        {/* Quick Generate Component */}
        <QuickGenerate />

        {/* Recent Reply Card */}
        <div className="surface" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Recent Reply</h2>
            <Link href="/history" className="btn-ghost" style={{ fontSize: '0.8125rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>View all history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.mostRecent ? (
            <>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text)' }}>Reply Generated</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Postmark tone={stats.mostRecent.tone} size="sm" />
                    <span>•</span>
                    <span>{formatDate(stats.mostRecent.created_at)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem', color: 'var(--text-dim)' }}>Original Email</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, background: 'var(--surface-raised)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  {truncate(stats.mostRecent.original_email, 140)}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem', color: 'var(--accent)' }}>AI Generated Reply</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6, background: 'var(--accent-dim)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--accent-border)' }}>
                  {truncate(stats.mostRecent.generated_reply, 180)}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                <Link href="/history" className="btn-ghost" style={{ flex: 1, minWidth: '120px', fontSize: '0.8125rem' }}>
                  <ExternalLink className="w-3.5 h-3.5" />
                  View in History
                </Link>
                <Link href="/generator" className="btn-primary" style={{ flex: 1, minWidth: '120px', fontSize: '0.8125rem' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  Open Generator
                </Link>
              </div>
            </>
          ) : !userId ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem 1rem', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-dim)', border: '1px solid var(--border)' }}>
                <User className="w-6 h-6" />
              </div>
              <p style={{ marginBottom: '0.375rem', fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>Guest Mode</p>
              <p style={{ marginBottom: '1.25rem', maxWidth: '280px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Sign in to save reply archives, organize templates, and sync across devices.
              </p>
              <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>Sign In</Link>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem', padding: '3rem 0' }}>
              No replies generated yet. Click &quot;Generate New Reply&quot; to start.
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM ROW (Recent Activity Table) ─────────────────── */}
      <div className="surface" style={{ padding: '1.75rem', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Recent Activity</h2>
          <Link href="/history" className="btn-ghost" style={{ fontSize: '0.8125rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', fontWeight: 700 }}>
              <div>Subject / Snippet</div>
              <div>Tone</div>
              <div>Generated</div>
            </div>

            {stats.recentActivity.map((activity, i) => (
              <div key={activity._id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', alignItems: 'center', padding: '1rem 0', borderBottom: i !== stats.recentActivity.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>{truncate(activity.original_email, 40) || 'Reply Generated'}</span>
                </div>
                <div>
                  <Postmark tone={activity.tone} size="sm" />
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {formatDate(activity.created_at)}
                </div>
              </div>
            ))}
          </div>
        ) : !userId ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem 0', fontSize: '0.875rem' }}>
            <p style={{ marginBottom: '0.25rem', fontWeight: 600, color: 'var(--text)' }}>Not signed in</p>
            <p style={{ fontSize: '0.8125rem' }}>Your recent activity will automatically appear here once you create an account.</p>
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
