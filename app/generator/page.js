'use client';

import { useState, useTransition, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { saveTemplate } from '@/lib/actions';
import Postmark from '@/components/Postmark';
import {
  Sparkles,
  Send,
  Wand2,
  UploadCloud,
  Copy,
  Check,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Briefcase,
  Smile,
  Zap,
  Target,
  Languages,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

const TONES = [
  { value: 'formal',     label: 'Formal',     desc: 'Professional & measured', icon: Briefcase },
  { value: 'friendly',   label: 'Friendly',   desc: 'Warm & approachable',      icon: Smile },
  { value: 'concise',    label: 'Concise',    desc: 'Short & direct',           icon: Zap },
  { value: 'persuasive', label: 'Persuasive', desc: 'Compelling & clear',       icon: Target },
];

function GeneratorInner() {
  const { data: session } = useSession();
  const isGuest = !session?.user;
  const [mode, setMode] = useState('generate'); // 'generate' or 'improve'
  
  // Generate State
  const [originalEmail, setOriginalEmail] = useState('');
  const [tone, setTone] = useState('formal');
  const [reply, setReply] = useState(null); // array of strings
  const [length, setLength] = useState('default');
  const [variations, setVariations] = useState(1);
  const [useEmojis, setUseEmojis] = useState(false);
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0);
  
  // Improve State
  const [draftReply, setDraftReply] = useState('');
  const [inputLanguage, setInputLanguage] = useState('Auto Detect');
  const [improveResult, setImproveResult] = useState(null); 
  // { improvedReply: "", mistakes: [], suggestions: [] }

  // Shared State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateLabel, setTemplateLabel] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  // Quick Replies State
  const [quickReplies, setQuickReplies] = useState([]);
  const [loadingQuickReplies, setLoadingQuickReplies] = useState(false);

  // File Upload State
  const fileInputRef = useRef(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    try {
      const savedTone = localStorage.getItem('mg-pref-tone');
      if (savedTone) setTone(savedTone);
      const savedLength = localStorage.getItem('mg-pref-length');
      if (savedLength) setLength(savedLength);
      const savedVars = localStorage.getItem('mg-pref-variations');
      if (savedVars) setVariations(parseInt(savedVars, 10));
      const savedEmojis = localStorage.getItem('mg-pref-emojis');
      if (savedEmojis) setUseEmojis(savedEmojis === 'true');
    } catch {}

    if (searchParams.get('reuse')) {
      const prefill = sessionStorage.getItem('prefillReply');
      if (prefill) {
        setReply([prefill]);
        sessionStorage.removeItem('prefillReply');
      }
    }
    // Pre-fill from query param
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setOriginalEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setOriginalEmail(data.text);
      setQuickReplies([]);
    } catch (err) {
      setError('File upload failed: ' + err.message);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleQuickReplies() {
    if (!originalEmail.trim()) return;
    setLoadingQuickReplies(true);
    setQuickReplies([]);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quick-replies', originalEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuickReplies(data.suggestions || []);
    } catch (err) {
      setError('Could not generate quick replies: ' + err.message);
    } finally {
      setLoadingQuickReplies(false);
    }
  }

  async function handleGenerate() {
    if (mode === 'generate' && !originalEmail.trim()) {
      setError('Paste an email to reply to first.');
      return;
    }
    if (mode === 'improve' && !draftReply.trim()) {
      setError('Paste your draft reply to improve first.');
      return;
    }

    setLoading(true);
    setError('');
    setReply(null);
    setImproveResult(null);

    try {
      const payload = mode === 'improve' 
        ? { action: 'improve', originalEmail, draftReply, inputLanguage }
        : { action: 'generate', originalEmail, tone, length, variations, useEmojis };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate reply.');

      if (mode === 'improve') {
        setImproveResult(data.improveResult);
      } else {
        setReply(data.reply);
        setCurrentVariationIndex(0);
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    const textToCopy = mode === 'improve' 
      ? improveResult?.improvedReply 
      : reply?.[currentVariationIndex];
      
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      const el = document.createElement('textarea');
      el.value = textToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSaveTemplate() {
    if (mode === 'improve' && !improveResult) return;
    if (mode === 'generate' && (!reply || !reply[currentVariationIndex])) return;
    setTemplateLabel('');
    setSaveStatus('');
    setShowSaveModal(true);
  }

  function handleConfirmSave() {
    setSaveStatus('saving');
    startTransition(async () => {
      try {
        const textToSave = mode === 'improve' ? improveResult.improvedReply : reply[currentVariationIndex];
        await saveTemplate(textToSave, templateLabel);
        setSaveStatus('saved');
        setTimeout(() => { setShowSaveModal(false); setSaveStatus(''); }, 1500);
      } catch {
        setSaveStatus('error');
      }
    });
  }

  return (
    <div className="page-wrap">
      {/* ── Page Header & Tabs ───────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h1 className="display-title" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
              AI Email Studio
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Generate nuanced contextual responses or proofread drafts with multi-provider AI.
            </p>
          </div>

          {/* Mode Switcher Pill */}
          <div style={{ display: 'flex', background: 'var(--surface-raised)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => { setMode('generate'); setError(''); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'generate' ? 'var(--surface)' : 'transparent',
                color: mode === 'generate' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: mode === 'generate' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: mode === 'generate' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Send className="w-3.5 h-3.5" />
              Generate Reply
            </button>
            <button
              type="button"
              onClick={() => { setMode('improve'); setError(''); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: mode === 'improve' ? 'var(--surface)' : 'transparent',
                color: mode === 'improve' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: mode === 'improve' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: mode === 'improve' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Wand2 className="w-3.5 h-3.5" />
              Improve My Reply
            </button>
          </div>
        </div>

        {/* Guest Mode Notice */}
        {isGuest && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              color: 'var(--text)',
            }}
          >
            <Info className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
            <span style={{ flex: 1 }}>
              You are using <strong>Guest Mode</strong>. Replies are generated freely with full AI power. <a href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</a> to preserve your history and save custom templates.
            </span>
          </div>
        )}
      </div>

      <div className="surface generator-layout" style={{ borderRadius: '16px' }}>
        {/* ── LEFT CONTROLS SIDEBAR ─────────────────────────────────────── */}
        <div className="generator-sidebar">
          {mode === 'generate' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <SlidersHorizontal className="w-4 h-4 text-[var(--text-dim)]" />
                <p className="label-caps" style={{ color: 'var(--text)' }}>Writing Style</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.625rem', marginBottom: '1.75rem' }}>
                {TONES.map(({ value, label, desc, icon: Icon }) => (
                  <button
                    key={value}
                    className={`tone-btn ${tone === value ? 'active' : ''}`}
                    onClick={() => setTone(value)}
                    type="button"
                    style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '0.75rem 1rem', minWidth: 0, gap: '0.875rem' }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: tone === value ? 'var(--accent)' : 'var(--surface-raised)', color: tone === value ? '#FFFFFF' : 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span className="tone-name" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.125rem', fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', lineHeight: 1.2, display: 'block' }}>{desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <p className="label-caps" style={{ marginBottom: '0.75rem' }}>Reply Length</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {['shorter', 'default', 'longer'].map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setLength(len)}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0.25rem',
                        border: `1px solid ${length === len ? 'var(--accent)' : 'var(--border)'}`,
                        background: length === len ? 'var(--accent-dim)' : 'var(--surface)',
                        color: length === len ? 'var(--accent)' : 'var(--text)',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      {len === 'default' ? 'Balanced' : len}
                    </button>
                  ))}
                </div>

                <p className="label-caps" style={{ marginBottom: '0.75rem' }}>Response Variations</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {[1, 3, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVariations(v)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: `1px solid ${variations === v ? 'var(--accent)' : 'var(--border)'}`,
                        background: variations === v ? 'var(--accent-dim)' : 'var(--surface)',
                        color: variations === v ? 'var(--accent)' : 'var(--text)',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      {v} {v === 1 ? 'Option' : 'Options'}
                    </button>
                  ))}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <div style={{ width: '36px', height: '20px', background: useEmojis ? 'var(--accent)' : 'var(--border)', borderRadius: '10px', position: 'relative', transition: 'background 0.2s' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: useEmojis ? '18px' : '2px', transition: 'left 0.2s' }} />
                  </div>
                  <input type="checkbox" checked={useEmojis} onChange={(e) => setUseEmojis(e.target.checked)} style={{ display: 'none' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>Include conversational emojis</span>
                </label>
              </div>
            </>
          )}

          {mode === 'improve' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>
                  Original Incoming Email <span style={{ color: 'var(--text-dim)', textTransform: 'none', fontWeight: 400 }}>(Optional Context)</span>
                </label>
                <textarea
                  className="input-base"
                  rows={4}
                  placeholder="Paste the email you received here for contextual analysis..."
                  value={originalEmail}
                  onChange={(e) => setOriginalEmail(e.target.value)}
                  style={{ minHeight: '100px', background: 'var(--surface)' }}
                />
              </div>

              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>
                  My Draft Reply <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <textarea
                  className="input-base"
                  rows={6}
                  placeholder="Paste your drafted response to refine..."
                  value={draftReply}
                  onChange={(e) => setDraftReply(e.target.value)}
                  style={{ minHeight: '140px', background: 'var(--surface)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label-caps" style={{ display: 'block', marginBottom: '0.375rem', color: 'var(--text)' }}>
                    Input Language
                  </label>
                  <select
                    value={inputLanguage}
                    onChange={(e) => setInputLanguage(e.target.value)}
                    className="input-base"
                    style={{ padding: '0.5rem 0.75rem', height: '38px', background: 'var(--surface)', fontSize: '0.8125rem' }}
                  >
                    <option value="Auto Detect">Auto Detect</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Hinglish">Hinglish</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label-caps" style={{ display: 'block', marginBottom: '0.375rem', color: 'var(--text)' }}>
                    Output Language
                  </label>
                  <select disabled className="input-base" style={{ padding: '0.5rem 0.75rem', height: '38px', background: 'var(--surface-raised)', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    <option>English (Global)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT MAIN STUDIO AREA ────────────────────────────────────── */}
        <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {mode === 'generate' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label className="label-caps" htmlFor="original-email-gen" style={{ color: 'var(--text)', margin: 0 }}>
                  Incoming Email Content
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {originalEmail.trim().length > 30 && (
                    <button
                      type="button"
                      onClick={handleQuickReplies}
                      disabled={loadingQuickReplies}
                      className="quick-reply-pill"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      {loadingQuickReplies ? (
                        <><div className="spinner" style={{ width: '10px', height: '10px' }} /> Analyzing...</>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5" /> Quick Replies</>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="btn-ghost"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '999px' }}
                    id="btn-upload-email-file"
                  >
                    {uploadingFile ? (
                      <><div className="spinner" style={{ width: '10px', height: '10px' }} /> Uploading...</>
                    ) : (
                      <><UploadCloud className="w-3.5 h-3.5" /> Upload .txt/.eml</>
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept=".txt,.eml,text/plain" style={{ display: 'none' }} onChange={handleFileUpload} id="input-email-file" />
                </div>
              </div>

              <textarea
                id="original-email-gen"
                className="input-base"
                rows={5}
                placeholder="Paste the email thread or question you received here…"
                value={originalEmail}
                onChange={(e) => { setOriginalEmail(e.target.value); setQuickReplies([]); }}
                style={{ minHeight: '130px', background: 'var(--surface-raised)' }}
              />

              {/* Quick Reply Pills */}
              {quickReplies.length > 0 && (
                <div style={{ marginTop: '0.875rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                    ⚡ Smart 1-Click Suggestions
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {quickReplies.map((qr, i) => (
                      <button
                        key={i}
                        type="button"
                        className="quick-reply-pill"
                        onClick={() => { setReply([qr.body]); setCurrentVariationIndex(0); }}
                        title={qr.body}
                      >
                        {qr.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Trigger Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={loading}
              style={{ padding: '0.625rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              id="btn-generate-main"
            >
              {loading ? (
                <><span className="spinner" /> {mode === 'improve' ? 'Refining with AI…' : 'Generating…'}</>
              ) : (
                <><Sparkles className="w-4 h-4" /> {mode === 'improve' ? 'Improve My Reply' : 'Generate Reply'}</>
              )}
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── RESULT VIEWPORT ────────────────────────────────────────── */}
          {mode === 'improve' ? (
            improveResult ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ border: '1px solid rgba(16, 185, 129, 0.3)', background: 'var(--surface-raised)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Check className="w-4 h-4" /> Improved Response
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-ghost" onClick={handleCopy} type="button" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                        {copied ? <><Check className="w-3 h-3 text-[var(--success)]" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={isGuest ? undefined : handleSaveTemplate}
                        disabled={isGuest}
                        title={isGuest ? 'Sign in to save templates' : 'Save as template'}
                        type="button"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', opacity: isGuest ? 0.5 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }}
                      >
                        <Bookmark className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                    {improveResult.improvedReply}
                  </p>
                </div>

                {improveResult.mistakes?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--text)' }}>Corrections &amp; Grammar Audit</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {improveResult.mistakes.map((mistake, i) => (
                        <div key={i} style={{ background: 'var(--surface-raised)', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '180px' }}>
                              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>Original</span>
                              <p style={{ fontSize: '0.8125rem', textDecoration: 'line-through', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{mistake.original}</p>
                            </div>
                            <div style={{ flex: 1, minWidth: '180px' }}>
                              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase' }}>Correction</span>
                              <p style={{ fontSize: '0.8125rem', color: 'var(--text)', marginTop: '0.2rem', fontWeight: 600 }}>{mistake.correction}</p>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-light)', paddingTop: '0.375rem' }}>
                            💡 {mistake.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ border: '1px dashed var(--border)', background: 'var(--surface-raised)', padding: '2.5rem 1.5rem', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Wand2 className="w-6 h-6" />
                </div>
                <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                  Your refined email will appear here
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', maxWidth: '320px' }}>
                  Paste your drafted reply on the left and click &quot;Improve My Reply&quot; to review grammar and tone.
                </p>
              </div>
            )
          ) : (
            reply && reply.length > 0 ? (
              <div style={{ border: '1px solid var(--border)', background: 'var(--surface-raised)', padding: '1.5rem', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Postmark tone={tone} size="sm" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>AI Generated Response</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-ghost" onClick={handleCopy} type="button" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}>
                      {copied ? <><Check className="w-3 h-3 text-[var(--success)]" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                    <button
                      className="btn-ghost"
                      onClick={isGuest ? undefined : handleSaveTemplate}
                      disabled={isGuest}
                      title={isGuest ? 'Sign in to save templates' : 'Save as template'}
                      type="button"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', opacity: isGuest ? 0.5 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }}
                    >
                      <Bookmark className="w-3 h-3" /> Save
                    </button>
                  </div>
                </div>

                <div className="reply-box" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '1.25rem', flex: 1, color: 'var(--text)' }}>
                  {reply[currentVariationIndex]}
                </div>

                {reply.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.25rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border-light)' }}>
                    <button
                      className="btn-ghost"
                      onClick={() => setCurrentVariationIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentVariationIndex === 0}
                      style={{ padding: '0.35rem 0.6rem' }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text)' }}>
                      Variation {currentVariationIndex + 1} of {reply.length}
                    </span>
                    <button
                      className="btn-ghost"
                      onClick={() => setCurrentVariationIndex((prev) => Math.min(reply.length - 1, prev + 1))}
                      disabled={currentVariationIndex === reply.length - 1}
                      style={{ padding: '0.35rem 0.6rem' }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ border: '1px dashed var(--border)', background: 'var(--surface-raised)', padding: '2.5rem 1.5rem', borderRadius: '12px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Send className="w-6 h-6" />
                </div>
                <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                  Your generated reply will appear here
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', maxWidth: '340px' }}>
                  Paste the email you received, choose your desired tone, and hit &quot;Generate Reply&quot;.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowSaveModal(false); }}>
          <div className="modal-box">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.375rem', color: 'var(--text)' }}>Save as Template</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Assign a name to easily locate and reuse this response later.</p>
            <label className="label-caps" htmlFor="template-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Template Title</label>
            <input
              id="template-label"
              type="text"
              className="input-base"
              style={{ marginBottom: '1.25rem' }}
              placeholder="e.g. Friendly Meeting Reschedule"
              value={templateLabel}
              onChange={(e) => setTemplateLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSave(); }}
            />
            {saveStatus === 'error' && (
              <div className="alert-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle className="w-4 h-4" />
                <span>Failed to save template. Please try again.</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setShowSaveModal(false)} type="button">Cancel</button>
              <button className="btn-primary" onClick={handleConfirmSave} disabled={saveStatus === 'saving' || saveStatus === 'saved'} type="button">
                {saveStatus === 'saving' && <><span className="spinner" /> Saving…</>}
                {saveStatus === 'saved' && '✓ Saved'}
                {!saveStatus && 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="page-wrap" style={{ color: 'var(--text-muted)' }}>
          Loading AI Email Studio…
        </div>
      }
    >
      <GeneratorInner />
    </Suspense>
  );
}
