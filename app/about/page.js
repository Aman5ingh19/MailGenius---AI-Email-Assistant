import Link from 'next/link';
import {
  Sparkles,
  Cpu,
  Zap,
  ShieldCheck,
  Layers,
  Globe,
  FileText,
  Lock,
  Bookmark,
  Database,
  Cloud,
  Server,
  CheckCircle2,
  ArrowRight,
  Target,
  Wand2,
  Smile,
  Briefcase,
  Activity,
  Check,
  Terminal,
  Key,
} from 'lucide-react';

export const metadata = {
  title: 'About MailGenius — Architecture, AI Engine & Security',
  description: 'Learn about MailGenius multi-provider AI engine, zero-retention privacy protocols, and technical architecture.',
};

export default function AboutPage() {
  return (
    <div className="page-wrap" style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <div
        className="surface"
        style={{
          borderRadius: '16px',
          padding: '2.5rem 2.25rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-raised) 100%)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
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
              Enterprise AI Architecture
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
              Version 2.4.0 Pro
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Activity className="w-3.5 h-3.5" /> All Services Operational
            </span>
          </div>

          <h1 className="display-title" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text)' }}>
            About MailGenius
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '780px', marginBottom: '2rem' }}>
            MailGenius is an intelligent, high-speed email communication system engineered to help professionals, executives, and support teams compose measured, context-aware, and persuasive email replies in seconds.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/generator" className="btn-primary" style={{ padding: '0.6875rem 1.5rem', fontSize: '0.9375rem' }}>
              <Sparkles className="w-4 h-4" /> Launch Generator Studio
            </Link>
            <Link href="/how-to-use" className="btn-ghost" style={{ padding: '0.6875rem 1.5rem', fontSize: '0.9375rem' }}>
              <span>View How-to-Use Guide</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── MULTI-PROVIDER AI PIPELINE ─────────────────────────────── */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)' }}>
              Multi-Provider AI Fallback Pipeline
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Engineered with intelligent fallback routing to guarantee 99.9% uptime and zero latency spikes.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {/* Primary Model Card */}
          <div className="surface" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                PRIMARY ENGINE
              </span>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
              Google Gemini 1.5 Flash
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Ultra-fast reasoning model with expansive context windows capable of processing long multi-turn email threads with sharp tonal alignment.
            </p>
          </div>

          {/* Fallback 1 Card */}
          <div className="surface" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--surface-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                AUTO FALLBACK 1
              </span>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Standby
              </span>
            </div>
            <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
              Groq LLaMA 3.3 (70B)
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Near-instantaneous inference processing through Groq LPU hardware acceleration if primary provider quota limits are reached.
            </p>
          </div>

          {/* Fallback 2 Card */}
          <div className="surface" style={{ padding: '1.75rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--surface-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                AUTO FALLBACK 2
              </span>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Standby
              </span>
            </div>
            <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
              OpenRouter LLaMA 3.2
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Distributed global redundancy routing ensuring uninterrupted operations and zero generation failures.
            </p>
          </div>
        </div>
      </section>

      {/* ── CORE CAPABILITIES & INNOVATIONS ──────────────────────────── */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)' }}>
              Core Capabilities
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Designed to accelerate response workflows without losing personal authenticity.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <div className="surface" style={{ padding: '1.5rem', borderRadius: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
              <Target className="w-5 h-5" />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.375rem' }}>
              4 Adaptive Tone Modulators
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Choose between <strong>Formal</strong>, <strong>Friendly</strong>, <strong>Concise</strong>, and <strong>Persuasive</strong> to match any professional, corporate, or sales context.
            </p>
          </div>

          <div className="surface" style={{ padding: '1.5rem', borderRadius: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
              <Wand2 className="w-5 h-5" />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.375rem' }}>
              Live Mistake &amp; Grammar Audit
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              In &quot;Improve My Reply&quot; mode, MailGenius analyzes drafts, identifies grammatical slips, and provides side-by-side correction cards with actionable explanations.
            </p>
          </div>

          <div className="surface" style={{ padding: '1.5rem', borderRadius: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(217, 119, 6, 0.12)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
              <Zap className="w-5 h-5" />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.375rem' }}>
              1-Click Smart Quick Replies
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              AI extracts core intent from incoming emails to generate instant 1-click response chips (Accept, Decline, Reschedule, Request Details).
            </p>
          </div>

          <div className="surface" style={{ padding: '1.5rem', borderRadius: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
              <FileText className="w-5 h-5" />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.375rem' }}>
              Document &amp; Email Parser
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Import complete email files directly (supporting <code>.txt</code> and standard <code>.eml</code> formats) without manual copy-pasting.
            </p>
          </div>

          <div className="surface" style={{ padding: '1.5rem', borderRadius: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
              <Globe className="w-5 h-5" />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.375rem' }}>
              Multilingual Input &amp; Refinement
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Draft replies in English, Hindi, or Hinglish — MailGenius seamlessly translates and polishes the response into fluent, professional English.
            </p>
          </div>

          <div className="surface" style={{ padding: '1.5rem', borderRadius: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.375rem' }}>
              Saved Templates &amp; Signatures
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Bookmark recurring replies in your template library and configure personalized custom email signatures in Settings.
            </p>
          </div>
        </div>
      </section>

      {/* ── PRIVACY & SECURITY ARCHITECTURE ──────────────────────────── */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="surface" style={{ padding: '2.25rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.25)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 700, color: 'var(--text)' }}>
              Enterprise Privacy &amp; Zero Retention
            </h2>
          </div>

          <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Your privacy and company confidentiality are our top priorities. MailGenius is built strictly on zero-retention principles:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--surface-raised)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <Lock className="w-4 h-4 text-[var(--accent)]" />
                <strong style={{ color: 'var(--text)', fontSize: '0.875rem' }}>Zero Model Training</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                No customer email content or generated responses are ever used to train public or commercial AI models.
              </p>
            </div>

            <div style={{ background: 'var(--surface-raised)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <strong style={{ color: 'var(--text)', fontSize: '0.875rem' }}>Isolated User Vaults</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                All saved templates and generation history are strictly scoped to your authenticated MongoDB user ID.
              </p>
            </div>

            <div style={{ background: 'var(--surface-raised)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <Zap className="w-4 h-4 text-[#D97706]" />
                <strong style={{ color: 'var(--text)', fontSize: '0.875rem' }}>Temporary Guest Sessions</strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Guest mode generations are strictly ephemeral and are not stored in any database archive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECHNICAL STACK SPECIFICATIONS ─────────────────────────── */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
          Technical Specifications
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.875rem' }}>
          {[
            { label: 'Application Framework', value: 'Next.js 16 (App Router & Turbopack)' },
            { label: 'UI Engine', value: 'React 19 & Lucide React Icons' },
            { label: 'Authentication', value: 'NextAuth.js v5 (JWT & Bcrypt 12)' },
            { label: 'Database & Vault', value: 'MongoDB Atlas with Mongoose' },
            { label: 'Asset Storage', value: 'Cloudinary CDN Media Hosting' },
            { label: 'Email Dispatch', value: 'Nodemailer SMTP TLS' },
            { label: 'Rate Limiting', value: 'Upstash / Redis Distributed Limiter' },
            { label: 'Validation & Logs', value: 'Zod Schemas & Winston Logger' },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>{label}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{value}</span>
            </div>
          ))}
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
          Ready to experience effortless email communication?
        </h3>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', maxWidth: '520px' }}>
          Generate your first response in seconds or explore our step-by-step interactive workflow guide.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <Link href="/generator" className="btn-primary" style={{ padding: '0.625rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles className="w-4 h-4" /> Start Generating Replies
          </Link>
          <Link href="/how-to-use" className="btn-ghost" style={{ padding: '0.625rem 1.5rem' }}>
            Read User Guide &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
