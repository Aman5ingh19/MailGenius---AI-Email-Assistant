'use client';

import { useState, useTransition, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { saveTemplate } from '@/lib/actions';
import Postmark from '@/components/Postmark';

const TONES = [
  { value: 'formal',     label: 'Formal',     desc: 'Professional & measured' },
  { value: 'friendly',   label: 'Friendly',   desc: 'Warm & approachable' },
  { value: 'concise',    label: 'Concise',    desc: 'Short & direct' },
  { value: 'persuasive', label: 'Persuasive', desc: 'Compelling & clear' },
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
    if (searchParams.get('reuse')) {
      const prefill = sessionStorage.getItem('prefillReply');
      if (prefill) {
        setReply([prefill]);
        sessionStorage.removeItem('prefillReply');
      }
    }
    // Pre-fill from inbox page
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
        setReply(data.reply); // array of strings
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

      {/* ── Page header & Tabs ───────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="display-title" style={{ fontSize: '1.875rem', marginBottom: '1rem' }}>
          AI Email Assistant
        </h1>

        {/* ── Guest Mode Banner ──────────────────────────────────────── */}
        {isGuest && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem', marginBottom: '1rem',
            background: 'rgba(139,44,57,0.06)', border: '1px solid rgba(139,44,57,0.2)',
            borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span style={{ flex: 1 }}>
              You&apos;re in <strong style={{ color: 'var(--text)' }}>Guest Mode</strong>. Replies will not be saved to history.
              {' '}<a href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</a> to unlock history, saved templates &amp; more.
            </span>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setMode('generate'); setError(''); }}
            style={{ 
              padding: '0.75rem 1rem', background: 'transparent', border: 'none', 
              borderBottom: mode === 'generate' ? '2px solid var(--accent)' : '2px solid transparent', 
              color: mode === 'generate' ? 'var(--accent)' : 'var(--text-muted)', 
              fontWeight: mode === 'generate' ? 600 : 500, cursor: 'pointer', fontSize: '0.9375rem' 
            }}
          >
            Generate Reply
          </button>
          <button 
             onClick={() => { setMode('improve'); setError(''); }}
             style={{ 
              padding: '0.75rem 1rem', background: 'transparent', border: 'none', 
              borderBottom: mode === 'improve' ? '2px solid var(--accent)' : '2px solid transparent', 
              color: mode === 'improve' ? 'var(--accent)' : 'var(--text-muted)', 
              fontWeight: mode === 'improve' ? 600 : 500, cursor: 'pointer', fontSize: '0.9375rem' 
            }}
          >
            Improve My Reply
          </button>
        </div>
      </div>

      <div className="surface generator-layout">
        
        {/* ── LEFT SIDEBAR (Controls/Input) ───────────────────────────── */}
        <div className="generator-sidebar">
          
          {mode === 'generate' && (
            <>
              <p className="label-caps" style={{ marginBottom: '1rem', color: 'var(--text)' }}>Writing style</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.625rem', marginBottom: '2rem' }}>
                {TONES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    className={`tone-btn ${tone === value ? 'active' : ''}`}
                    onClick={() => setTone(value)}
                    type="button"
                    style={{ flexDirection: 'row', justifyContent: 'flex-start', padding: '0.75rem 1rem', minWidth: 0, gap: '0.875rem' }}
                  >
                    <Postmark tone={value} size="sm" rotate={0} />
                    <div style={{ textAlign: 'left' }}>
                      <span className="tone-name" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.125rem' }}>{label}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', lineHeight: 1.2, display: 'block' }}>{desc}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <p className="label-caps" style={{ marginBottom: '0.875rem' }}>Reply length</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                   <button type="button" onClick={() => setLength('shorter')} style={{ flex: 1, padding: '0.625rem', border: `1px solid ${length === 'shorter' ? 'var(--accent)' : 'var(--border)'}`, background: length === 'shorter' ? 'var(--surface)' : 'transparent', borderRadius: '4px', textAlign: 'center', fontSize: '0.8125rem', color: length === 'shorter' ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>Shorter</button>
                   <button type="button" onClick={() => setLength('longer')} style={{ flex: 1, padding: '0.625rem', border: `1px solid ${length === 'longer' ? 'var(--accent)' : 'var(--border)'}`, background: length === 'longer' ? 'var(--surface)' : 'transparent', borderRadius: '4px', textAlign: 'center', fontSize: '0.8125rem', color: length === 'longer' ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>Longer</button>
                   {length !== 'default' && <button type="button" onClick={() => setLength('default')} className="btn-ghost" style={{ padding: '0 0.5rem', fontSize: '0.75rem' }}>Reset</button>}
                </div>

                <p className="label-caps" style={{ marginBottom: '0.875rem' }}>Number of variations</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                   {[1, 3, 5].map(v => (
                     <button key={v} type="button" onClick={() => setVariations(v)} style={{ flex: 1, padding: '0.625rem', border: `1px solid ${variations === v ? 'var(--accent)' : 'var(--border)'}`, background: variations === v ? 'var(--surface)' : 'transparent', borderRadius: '4px', textAlign: 'center', fontSize: '0.8125rem', color: variations === v ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{v}</button>
                   ))}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                   <div style={{ width: '36px', height: '20px', background: useEmojis ? 'var(--accent)' : 'var(--border)', borderRadius: '10px', position: 'relative', transition: 'background 0.2s' }}>
                      <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', left: useEmojis ? '18px' : '2px', transition: 'left 0.2s' }} />
                   </div>
                   <input type="checkbox" checked={useEmojis} onChange={e => setUseEmojis(e.target.checked)} style={{ display: 'none' }} />
                   <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Use emojis</span>
                </label>
              </div>
            </>
          )}

          {mode === 'improve' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>
                  Original Email <span style={{ color: 'var(--text-dim)', textTransform: 'none', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  className="input-base"
                  rows={4}
                  placeholder="Paste the email you are replying to..."
                  value={originalEmail}
                  onChange={(e) => setOriginalEmail(e.target.value)}
                  style={{ minHeight: '100px', background: 'var(--surface)', border: '1px solid var(--border)' }}
                />
              </div>

              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>
                  My Draft Reply <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <textarea
                  className="input-base"
                  rows={6}
                  placeholder="Paste your drafted reply here..."
                  value={draftReply}
                  onChange={(e) => setDraftReply(e.target.value)}
                  style={{ minHeight: '150px', background: 'var(--surface)', border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>Input Language</label>
                  <select 
                    value={inputLanguage} 
                    onChange={e => setInputLanguage(e.target.value)}
                    className="input-base"
                    style={{ padding: '0.5rem', height: '40px', background: 'var(--surface)' }}
                  >
                    <option value="Auto Detect">Auto Detect</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Hinglish">Hinglish</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)' }}>Output Language</label>
                  <select disabled className="input-base" style={{ padding: '0.5rem', height: '40px', background: 'var(--bg)', color: 'var(--text-muted)' }}>
                    <option>English Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT MAIN AREA (Content / Output) ──────────────────── */}
        <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          {mode === 'generate' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {originalEmail.trim().length > 30 && (
                  <button
                    type="button"
                    onClick={handleQuickReplies}
                    disabled={loadingQuickReplies}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: '999px', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}
                  >
                    {loadingQuickReplies ? (
                      <><div className="spinner" style={{ width: '10px', height: '10px', borderWidth: '1.5px', borderTopColor: 'var(--accent)', borderColor: 'var(--accent-border)' }} />Analyzing...</>
                    ) : (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z"/></svg>Quick Replies</>
                    )}
                  </button>
                )}
                {/* File Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: '999px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}
                  id="btn-upload-email-file"
                >
                  {uploadingFile ? (
                    <><div className="spinner" style={{ width: '10px', height: '10px', borderWidth: '1.5px', borderTopColor: 'var(--text-muted)', borderColor: 'var(--border)' }} />Uploading...</>
                  ) : (
                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Upload .txt/.eml</>
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept=".txt,.eml,text/plain" style={{ display: 'none' }} onChange={handleFileUpload} id="input-email-file" />
              </div>
              <textarea
                id="original-email-gen"
                className="input-base"
                rows={4}
                placeholder="Paste the email you received here…"
                value={originalEmail}
                onChange={(e) => { setOriginalEmail(e.target.value); setQuickReplies([]); }}
                style={{ minHeight: '120px', background: 'var(--bg)', border: '1px solid var(--border)' }}
              />
              {/* Quick Reply Pills */}
              {quickReplies.length > 0 && (
                <div style={{ marginTop: '0.875rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
                    ⚡ Smart Quick Replies — click to use
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button
              className="btn-primary"
              onClick={handleGenerate}
              disabled={loading}
              style={{ padding: '0.625rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              id="btn-generate-main"
            >
              {loading ? (
                <><span className="spinner" /> {mode === 'improve' ? 'Improving…' : 'Generating…'}</>
              ) : (
                <>✨ {mode === 'improve' ? 'Improve My Reply' : 'Generate Reply'}</>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
              <span style={{ flexShrink: 0 }}>—</span><span>{error}</span>
            </div>
          )}

          {/* ── RESULT AREA ── */}
          {mode === 'improve' ? (
            /* Improve Results UI */
            improveResult ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ border: '1px solid var(--success-dim)', background: 'var(--bg)', padding: '1.5rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--success)' }}>Improved Reply</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-ghost" onClick={handleCopy} type="button" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      {isGuest ? (
                        <button className="btn-ghost" disabled title="Sign in to save templates" type="button" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', opacity: 0.5, cursor: 'not-allowed' }}>
                          Save
                        </button>
                      ) : (
                        <button className="btn-ghost" onClick={handleSaveTemplate} type="button" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                          Save
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {improveResult.improvedReply}
                  </p>
                </div>

                {improveResult.mistakes?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>Mistakes Found</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {improveResult.mistakes.map((mistake, i) => (
                        <div key={i} style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase' }}>Original</span>
                              <p style={{ fontSize: '0.875rem', textDecoration: 'line-through', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{mistake.original}</p>
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase' }}>Correction</span>
                              <p style={{ fontSize: '0.875rem', color: 'var(--text)', marginTop: '0.25rem' }}>{mistake.correction}</p>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                            💡 {mistake.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {improveResult.suggestions?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text)' }}>AI Suggestions</h4>
                    <ul style={{ paddingLeft: '1.25rem', margin: 0, color: 'var(--text-muted)' }}>
                      {improveResult.suggestions.map((sug, i) => (
                        <li key={i} style={{ fontSize: '0.875rem', marginBottom: '0.375rem', lineHeight: 1.5 }}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ border: '1px dashed var(--border-light)', background: 'var(--bg)', padding: '1.5rem', borderRadius: '8px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </div>
                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.9375rem' }}>
                  Your improved reply will appear here.
                </p>
              </div>
            )
          ) : (
            /* Generate Results UI */
            reply && reply.length > 0 ? (
              <div style={{ border: '1px dashed var(--border-light)', background: 'var(--bg)', padding: '1.5rem', borderRadius: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <Postmark tone={tone} size="sm" />
                     <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Generated reply</span>
                   </div>
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <button className="btn-ghost" onClick={handleCopy} type="button" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                       {copied ? 'Copied' : 'Copy'}
                     </button>
                     {isGuest ? (
                        <button className="btn-ghost" disabled title="Sign in to save templates" type="button" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem', opacity: 0.5, cursor: 'not-allowed' }}>
                          Save
                        </button>
                      ) : (
                        <button className="btn-ghost" onClick={handleSaveTemplate} type="button" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                          Save
                        </button>
                      )}
                   </div>
                </div>
                <div className="reply-box" style={{ background: 'transparent', border: 'none', padding: 0, flex: 1 }}>{reply[currentVariationIndex]}</div>
                {reply.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                    <button className="btn-ghost" onClick={() => setCurrentVariationIndex(prev => Math.max(0, prev - 1))} disabled={currentVariationIndex === 0} style={{ padding: '0.25rem 0.5rem', fontSize: '1rem' }}>‹</button>
                    <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>{currentVariationIndex + 1} / {reply.length}</span>
                    <button className="btn-ghost" onClick={() => setCurrentVariationIndex(prev => Math.min(reply.length - 1, prev + 1))} disabled={currentVariationIndex === reply.length - 1} style={{ padding: '0.25rem 0.5rem', fontSize: '1rem' }}>›</button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ border: '1px dashed var(--border-light)', background: 'var(--bg)', padding: '1.5rem', borderRadius: '8px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                <Postmark tone="formal" size="md" rotate={-5} />
                <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: '0.9375rem' }}>
                  Your generated reply will appear here.
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
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--text)' }}>Save as template</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Name this template so you can find it later.</p>
            <label className="label-caps" htmlFor="template-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Template name</label>
            <input
              id="template-label"
              type="text"
              className="input-base"
              style={{ resize: 'none', marginBottom: '1.25rem' }}
              placeholder="e.g. Polite meeting decline"
              value={templateLabel}
              onChange={(e) => setTemplateLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSave(); }}
            />
            {saveStatus === 'error' && (
              <div className="alert-error" style={{ marginBottom: '1rem' }}><span>—</span><span>Failed to save. Please try again.</span></div>
            )}
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setShowSaveModal(false)} type="button">Cancel</button>
              <button className="btn-primary" onClick={handleConfirmSave} disabled={saveStatus === 'saving' || saveStatus === 'saved'} type="button">
                {saveStatus === 'saving' && <><span className="spinner" /> Saving…</>}
                {saveStatus === 'saved' && 'Saved'}
                {!saveStatus && 'Save template'}
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
          Loading…
        </div>
      }
    >
      <GeneratorInner />
    </Suspense>
  );
}
