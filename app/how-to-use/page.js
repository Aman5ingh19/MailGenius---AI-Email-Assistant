import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  FileText,
  Sliders,
  Zap,
  Wand2,
  Copy,
  Check,
  Bookmark,
  ArrowRight,
  Search,
  Settings,
  Layers,
  CornerDownLeft,
  Briefcase,
  Smile,
  Target,
  UploadCloud,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export const metadata = {
  title: 'How to Use MailGenius — Complete Step-by-Step User Guide',
  description: 'Master AI email generation, tone modulation, live grammar auditing, 1-click quick replies, and template management with MailGenius.',
};

export default function HowToUsePage() {
  return (
    <div className="page-wrap" style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <div
        className="surface"
        style={{
          borderRadius: '16px',
          padding: '2.5rem 2.25rem',
          marginBottom: '2.5rem',
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-raised) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.625rem',
              borderRadius: '999px',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              border: '1px solid var(--accent-border)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            User Masterclass &amp; Guide
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'var(--surface)',
              padding: '0.25rem 0.625rem',
              borderRadius: '999px',
              border: '1px solid var(--border)',
            }}
          >
            5-Minute Quick Read
          </span>
        </div>

        <h1 className="display-title" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text)' }}>
          How to Use MailGenius
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '780px', marginBottom: '2rem' }}>
          A step-by-step masterclass on generating crisp replies, tuning your tone of voice, auditing email drafts for errors, and accelerating your daily inbox workflow.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/generator" className="btn-primary" style={{ padding: '0.6875rem 1.5rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles className="w-4 h-4" /> Open Studio Generator
          </Link>
          <Link href="/settings" className="btn-ghost" style={{ padding: '0.6875rem 1.5rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Configure Defaults</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── STEP-BY-STEP WORKFLOW ──────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3.5rem' }}>
        {/* Step 1 */}
        <div className="surface" style={{ borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                fontWeight: 800,
                fontSize: '1.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
                border: '1px solid var(--accent-border)',
              }}
            >
              1
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                  Ingest Email Content or Upload Files
                </h2>
                <span style={{ fontSize: '0.75rem', background: 'var(--surface-raised)', color: 'var(--text-muted)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  Supports .txt &amp; .eml
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Navigate to the <strong>Generate Reply</strong> tab. Paste the raw email thread into the text area. Alternatively, click <strong>Upload .txt/.eml</strong> to drop an exported email message directly — MailGenius will automatically parse headers, subjects, and body content.
              </p>
              <div style={{ background: 'var(--surface-raised)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)', fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  <strong style={{ color: 'var(--text)' }}>Pro-Tip:</strong> You don&apos;t need to clean up email signatures or timestamps. Gemini 1.5 Flash isolates core intent automatically.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="surface" style={{ borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                fontWeight: 800,
                fontSize: '1.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
                border: '1px solid var(--accent-border)',
              }}
            >
              2
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                Select Your Voice: 4 Adaptive Tone Modulators
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Choose the exact tone that aligns with your recipient and business goal:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px', borderLeft: '3px solid #0284C7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <Briefcase className="w-4 h-4 text-[#0284C7]" />
                    <strong style={{ color: 'var(--text)' }}>Formal</strong>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Polished, diplomatic &amp; structured. Ideal for executives, enterprise clients, legal, or finance.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px', borderLeft: '3px solid #10B981' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <Smile className="w-4 h-4 text-[#10B981]" />
                    <strong style={{ color: 'var(--text)' }}>Friendly</strong>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Warm, empathetic &amp; approachable. Ideal for team catchups, customer success, and partners.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px', borderLeft: '3px solid #D97706' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <Zap className="w-4 h-4 text-[#D97706]" />
                    <strong style={{ color: 'var(--text)' }}>Concise</strong>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Direct, bulleted &amp; zero fluff. Perfect for quick confirmations, action items, and busy founders.
                  </p>
                </div>

                <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px', borderLeft: '3px solid #8B5CF6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <Target className="w-4 h-4 text-[#8B5CF6]" />
                    <strong style={{ color: 'var(--text)' }}>Persuasive</strong>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Compelling, benefit-driven &amp; motivating. Crafted for sales pitches, contract negotiations, and follow-ups.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="surface" style={{ borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                fontWeight: 800,
                fontSize: '1.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
                border: '1px solid var(--accent-border)',
              }}
            >
              3
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                Instant 1-Click Smart Quick Replies
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                When an email is longer than 30 characters, the <strong>⚡ Quick Replies</strong> pill will appear above the input box.
              </p>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <li>Click <strong>⚡ Quick Replies</strong> — AI analyzes the sender&apos;s request in real-time.</li>
                <li>Instant suggested action chips will appear (e.g. <em>&quot;Accept meeting for Tuesday&quot;</em>, <em>&quot;Politely decline with reason&quot;</em>, <em>&quot;Request pitch deck&quot;</em>).</li>
                <li>Click any pill to instantly populate the full drafted response!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="surface" style={{ borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                fontWeight: 800,
                fontSize: '1.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
                border: '1px solid var(--accent-border)',
              }}
            >
              4
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                Proofreading &amp; Refining: &quot;Improve My Reply&quot; Mode
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Already typed out a rough draft and want to ensure it&apos;s grammatically flawless and tonally crisp?
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px' }}>
                  <strong style={{ color: 'var(--text)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                    1. Switch Tabs
                  </strong>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Select the <strong>Improve My Reply</strong> tab in the generator studio.
                  </p>
                </div>
                <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px' }}>
                  <strong style={{ color: 'var(--text)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                    2. Paste Draft &amp; Language
                  </strong>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Paste your rough response (supports Auto-Detect, English, Hindi, or Hinglish).
                  </p>
                </div>
                <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px' }}>
                  <strong style={{ color: 'var(--text)', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
                    3. Live Audit
                  </strong>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Receive an improved reply alongside highlighted mistake cards and actionable tips.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5 */}
        <div className="surface" style={{ borderRadius: '16px', padding: '2rem', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                fontWeight: 800,
                fontSize: '1.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
                border: '1px solid var(--accent-border)',
              }}
            >
              5
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
                Copy, Save Reusable Templates &amp; Custom Signatures
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Once your reply is ready:
              </p>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong style={{ color: 'var(--text)' }}>1-Click Copy:</strong> Click &quot;Copy&quot; to grab the text formatted for Gmail, Outlook, Apple Mail, or Superhuman.</li>
                <li><strong style={{ color: 'var(--text)' }}>Save Template:</strong> Click &quot;Save&quot; to bookmark it to your Saved Templates vault for instant reuse.</li>
                <li><strong style={{ color: 'var(--text)' }}>Custom Signature:</strong> Head to <strong>Settings</strong> to save your signature; it can be automatically applied to your workflow.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── KEYBOARD SHORTCUTS & PRO TIPS ──────────────────────────── */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.25rem' }}>
          ⚡ Power User Shortcuts &amp; Best Practices
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div className="surface" style={{ padding: '1.25rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ padding: '0.2rem 0.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>
                Enter
              </span>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text)' }}>Quick Search</strong>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Type into the search bar at the top and press Enter to instantly search through your past replies.
            </p>
          </div>

          <div className="surface" style={{ padding: '1.25rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ padding: '0.2rem 0.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>
                Settings
              </span>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text)' }}>Auto-Copy Preference</strong>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Enable &quot;Auto-Copy to Clipboard&quot; in Settings to copy replies the moment generation completes.
            </p>
          </div>

          <div className="surface" style={{ padding: '1.25rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ padding: '0.2rem 0.5rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text)', fontWeight: 600 }}>
                Multi-Option
              </span>
              <strong style={{ fontSize: '0.875rem', color: 'var(--text)' }}>Variation Flipping</strong>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Generate 3 or 5 variations and cycle through them using the ‹ › pagination arrows to find the perfect phrasing.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ─────────────────────────────────────────────── */}
      <div
        className="surface"
        style={{
          borderRadius: '16px',
          padding: '2.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)' }}>
          You&apos;re all set to write 10x faster!
        </h3>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', maxWidth: '480px' }}>
          Open the generator studio and paste your first email to see MailGenius in action.
        </p>
        <Link href="/generator" className="btn-primary" style={{ padding: '0.625rem 1.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles className="w-4 h-4" /> Open AI Generator Studio
        </Link>
      </div>
    </div>
  );
}
