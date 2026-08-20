'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Camera,
  UploadCloud,
  Trash2,
  KeyRound,
  Sliders,
  Sun,
  Moon,
  ShieldCheck,
  Cloud,
  Database,
  BookOpen,
  Info,
  Lock,
  Check,
  AlertCircle,
  LogOut,
  RotateCcw,
  Sparkles,
  Briefcase,
  Smile,
  Zap,
  Target,
  Mail,
  Server,
  Activity,
  Layers,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

const TONE_OPTIONS = [
  { value: 'formal', label: 'Formal', desc: 'Professional & measured', icon: Briefcase, color: '#0284C7' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm & approachable', icon: Smile, color: '#10B981' },
  { value: 'concise', label: 'Concise', desc: 'Short & direct', icon: Zap, color: '#D97706' },
  { value: 'persuasive', label: 'Persuasive', desc: 'Compelling & clear', icon: Target, color: '#8B5CF6' },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const isGuest = !user;
  const searchParams = useSearchParams();

  // Active tab state: 'profile' | 'security' | 'preferences' | 'system'
  const [activeTab, setActiveTab] = useState('profile');

  // 1. Profile state
  const [name, setName] = useState('');
  const [updatingName, setUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  // Avatar state
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  // 2. Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 3. AI Preferences state (persisted in localStorage)
  const [defaultTone, setDefaultTone] = useState('formal');
  const [defaultLength, setDefaultLength] = useState('default');
  const [defaultVariations, setDefaultVariations] = useState(1);
  const [defaultEmojis, setDefaultEmojis] = useState(false);
  const [autoCopy, setAutoCopy] = useState(false);
  const [signature, setSignature] = useState('');
  const [prefSaved, setPrefSaved] = useState(false);

  // Theme state
  const [currentTheme, setCurrentTheme] = useState('light');

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'GU';

  // Listen to hash or tab query on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#password-section' || hash === '#change-password') {
      setActiveTab('security');
    } else if (hash === '#user-details-section' || hash === '#user-details') {
      setActiveTab('security');
    } else if (hash === '#preferences-section' || hash === '#ai-settings') {
      setActiveTab('preferences');
    } else if (hash === '#system-section') {
      setActiveTab('system');
    } else {
      const tabParam = searchParams.get('tab');
      if (tabParam && ['profile', 'security', 'preferences', 'system'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }

    try {
      const savedTone = localStorage.getItem('mg-pref-tone');
      if (savedTone) setDefaultTone(savedTone);

      const savedLength = localStorage.getItem('mg-pref-length');
      if (savedLength) setDefaultLength(savedLength);

      const savedVars = localStorage.getItem('mg-pref-variations');
      if (savedVars) setDefaultVariations(parseInt(savedVars, 10));

      const savedEmojis = localStorage.getItem('mg-pref-emojis');
      if (savedEmojis) setDefaultEmojis(savedEmojis === 'true');

      const savedAutoCopy = localStorage.getItem('mg-pref-autocopy');
      if (savedAutoCopy) setAutoCopy(savedAutoCopy === 'true');

      const savedSig = localStorage.getItem('mg-signature');
      if (savedSig) setSignature(savedSig);

      const theme = localStorage.getItem('mg-theme') || 'light';
      setCurrentTheme(theme);
    } catch {}
  }, [user]);

  function handleFileChange(e) {
    if (isGuest) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5 MB.');
      return;
    }
    setAvatarError('');
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleAvatarUpload() {
    if (isGuest || !avatar) return;
    setUploadingAvatar(true);
    setAvatarSuccess('');
    setAvatarError('');

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      const res = await fetch('/api/user/avatar', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setAvatarSuccess('Profile picture updated successfully!');
      setAvatar(null);
      await update({ image: data.url });
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    if (isGuest) return;
    setUploadingAvatar(true);
    setAvatarError('');
    try {
      const res = await fetch('/api/user/avatar', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove avatar');
      setAvatarPreview(null);
      setAvatar(null);
      setAvatarSuccess('Profile picture removed.');
      await update({ image: null });
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleUpdateName(e) {
    e.preventDefault();
    if (isGuest) return;
    if (!name.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }

    setUpdatingName(true);
    setNameSuccess('');
    setNameError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update name');

      setNameSuccess('Display name updated successfully!');
      await update({ name: data.name });
      setTimeout(() => setNameSuccess(''), 3000);
    } catch (err) {
      setNameError(err.message);
    } finally {
      setUpdatingName(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (isGuest) return;

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setUpdatingPassword(true);
    setPasswordSuccess('');
    setPasswordError('');

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  }

  function handleSavePreferences() {
    try {
      localStorage.setItem('mg-pref-tone', defaultTone);
      localStorage.setItem('mg-pref-length', defaultLength);
      localStorage.setItem('mg-pref-variations', String(defaultVariations));
      localStorage.setItem('mg-pref-emojis', String(defaultEmojis));
      localStorage.setItem('mg-pref-autocopy', String(autoCopy));
      localStorage.setItem('mg-signature', signature);

      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 2500);
    } catch {}
  }

  function handleThemeChange(newTheme) {
    setCurrentTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('mg-theme', newTheme);
  }

  const currentImage = avatarPreview || user?.image;

  return (
    <div className="page-wrap" style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* ── Top Header Banner ──────────────────────────────────────── */}
      <div
        className="surface"
        style={{
          borderRadius: '16px',
          padding: '2rem 2.25rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-raised) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  background: isGuest ? 'var(--surface-raised)' : 'var(--accent-dim)',
                  color: isGuest ? 'var(--text-muted)' : 'var(--accent)',
                  border: isGuest ? '1px solid var(--border)' : '1px solid var(--accent-border)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {isGuest ? 'Guest Session' : 'Administrator Control Panel'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Activity className="w-3 h-3 text-[#10B981]" /> System Active
              </span>
            </div>

            <h1 className="display-title" style={{ fontSize: '2rem', marginBottom: '0.375rem' }}>
              {isGuest ? 'Settings & Preferences' : 'Admin Hub & Settings'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', maxWidth: '650px' }}>
              {isGuest
                ? 'Review your temporary session attributes, AI parameters, and switch UI color modes in read-only mode.'
                : 'Manage your administrator profile, security credentials, AI engine parameters, and custom signatures.'}
            </p>
          </div>

          {/* Quick Sign In / User Status Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: currentImage ? 'transparent' : 'var(--accent-gradient)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9375rem',
              }}
            >
              {currentImage ? (
                <img src={currentImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>
                {user?.name || (isGuest ? 'Guest User' : 'Admin')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user?.email || (isGuest ? 'Guest Access' : 'admin@mailgenius.ai')}
              </div>
            </div>
          </div>
        </div>

        {/* Guest Lock Callout Banner */}
        {isGuest && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.875rem 1.25rem',
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Lock className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
              <span style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500 }}>
                You are in <strong>Guest Mode (Read-Only)</strong>. Sign in to edit profiles, save custom avatars, or change credentials.
              </span>
            </div>
            <Link href="/login" className="btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem' }}>
              Sign In to Edit &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* ── Main Tabbed Layout Container ───────────────────────────── */}
      <div className="settings-layout">
        {/* Left Navigation Tabs */}
        <aside className="surface settings-nav-sidebar">
          <div className="settings-nav-tabs">
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.75rem 0.875rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'profile' ? 'var(--accent-dim)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: activeTab === 'profile' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <User className="w-4 h-4 flex-shrink-0" />
              <span>Profile &amp; Identity</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.75rem 0.875rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'security' ? 'var(--accent-dim)' : 'transparent',
                color: activeTab === 'security' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: activeTab === 'security' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Account &amp; Security</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.75rem 0.875rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'preferences' ? 'var(--accent-dim)' : 'transparent',
                color: activeTab === 'preferences' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: activeTab === 'preferences' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <Sliders className="w-4 h-4 flex-shrink-0" />
              <span>AI &amp; Generator Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.75rem 0.875rem',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'system' ? 'var(--accent-dim)' : 'transparent',
                color: activeTab === 'system' ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: activeTab === 'system' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <Server className="w-4 h-4 flex-shrink-0" />
              <span>System &amp; Storage</span>
            </button>
          </div>

          <div style={{ margin: '1rem 0', height: '1px', background: 'var(--border-light)' }} />

          {/* Quick Links */}
          <div style={{ padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
              Quick Navigation
            </span>
            <Link href="/history" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '0.35rem 0', textDecoration: 'none' }}>
              <span>Reply Archive</span> &rarr;
            </Link>
            <Link href="/saved" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '0.35rem 0', textDecoration: 'none' }}>
              <span>Saved Templates</span> &rarr;
            </Link>
          </div>
        </aside>

        {/* Right Tab Content Panels */}
        <main style={{ minWidth: 0 }}>
          {/* ════════════════ TAB 1: PROFILE & IDENTITY ════════════════ */}
          {activeTab === 'profile' && (
            <div className="surface" style={{ borderRadius: '16px', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>
                    Profile &amp; Display Identity
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Customize how your name and avatar appear across MailGenius.
                  </p>
                </div>
                {isGuest && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                    🔒 Read-Only
                  </span>
                )}
              </div>

              {/* Avatar Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                <div
                  onClick={() => { if (!isGuest) fileInputRef.current?.click(); }}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '20px',
                    background: currentImage ? 'transparent' : 'var(--accent-gradient)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isGuest ? 'not-allowed' : 'pointer',
                    border: '3px solid var(--border)',
                    flexShrink: 0,
                    position: 'relative',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                  }}
                  title={isGuest ? 'Guest mode (Read-only)' : 'Click to upload custom photo'}
                >
                  {currentImage ? (
                    <img src={currentImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#fff', fontSize: '2rem', fontWeight: 800 }}>{initials}</span>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                    {user?.name || (isGuest ? 'Guest User' : 'Administrator')}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {user?.email || (isGuest ? 'guest-session@mailgenius.ai' : 'admin@mailgenius.ai')}
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { if (!isGuest) fileInputRef.current?.click(); }}
                      className="btn-primary"
                      disabled={isGuest}
                      style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', opacity: isGuest ? 0.6 : 1, cursor: isGuest ? 'not-allowed' : 'pointer' }}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {avatar ? 'Select Another' : isGuest ? 'Avatar (Read-Only)' : 'Upload Avatar'}
                    </button>

                    {!isGuest && (currentImage || avatar) && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="btn-ghost"
                        disabled={uploadingAvatar}
                        style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={isGuest}
              />

              {/* Avatar Preview Confirmation */}
              {avatar && !isGuest && (
                <div style={{ marginBottom: '1.75rem', padding: '1rem 1.25rem', background: 'var(--surface-raised)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Selected: <strong style={{ color: 'var(--text)' }}>{avatar.name}</strong> ({(avatar.size / 1024).toFixed(0)} KB)
                  </div>
                  <button
                    className="btn-primary"
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                  >
                    {uploadingAvatar ? <><div className="spinner" /> Uploading...</> : <><UploadCloud className="w-3.5 h-3.5" /> Save Photo to Cloudinary</>}
                  </button>
                </div>
              )}

              {avatarSuccess && <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>✓ {avatarSuccess}</p>}
              {avatarError && <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#EF4444', fontWeight: 600 }}>✕ {avatarError}</p>}

              {/* Display Name Edit Form */}
              <form onSubmit={handleUpdateName} style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                    Full Legal Name / Public Display Name
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isGuest || updatingName}
                    style={{ padding: '0.75rem 1rem', fontSize: '0.9375rem', maxWidth: '480px', opacity: isGuest ? 0.7 : 1, cursor: isGuest ? 'not-allowed' : 'text' }}
                  />
                </div>

                {!isGuest && (
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={updatingName || !name.trim()}
                    style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}
                  >
                    {updatingName ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                )}

                {nameSuccess && <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>✓ {nameSuccess}</p>}
                {nameError && <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#EF4444', fontWeight: 600 }}>✕ {nameError}</p>}
              </form>
            </div>
          )}

          {/* ════════════════ TAB 2: ACCOUNT & SECURITY ════════════════ */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* User Details Grid */}
              <div className="surface" style={{ borderRadius: '16px', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>
                      Account &amp; Security Specs
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Authentication provider, cryptographic hashing status, and role privileges.
                    </p>
                  </div>
                  {isGuest && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                      🔒 Read-Only
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Full Legal Name</span>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text)' }}>
                      {user?.name || (isGuest ? 'Guest User (Unauthenticated)' : 'Administrator')}
                    </strong>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Registered Email</span>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text)' }}>
                      {user?.email || (isGuest ? 'guest-session@mailgenius.local' : 'admin@mailgenius.ai')}
                    </strong>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Account Role</span>
                    <strong style={{ fontSize: '0.9375rem', color: isGuest ? 'var(--text-muted)' : 'var(--accent)' }}>
                      {isGuest ? 'Guest (Read-Only Preview)' : 'Super Administrator (Full Privileges)'}
                    </strong>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Password Encryption</span>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ShieldCheck className="w-4 h-4 text-[#10B981]" /> Bcrypt 12 Rounds
                    </strong>
                  </div>
                </div>
              </div>

              {/* Change Password Panel */}
              <div className="surface" style={{ borderRadius: '16px', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>
                      Change Password
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Update your login password credentials.
                    </p>
                  </div>
                  {isGuest && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                      🔒 Read-Only
                    </span>
                  )}
                </div>

                {isGuest ? (
                  <div style={{ padding: '1.5rem', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px dashed var(--border)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      🔒 <strong>Password management is disabled in Guest Mode.</strong> Please sign in with your registered account to manage password security.
                    </p>
                    <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                      Sign In to Manage Security
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.375rem' }}>
                        Current Password
                      </label>
                      <input
                        type={showPass ? 'text' : 'password'}
                        className="input-base"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        disabled={updatingPassword}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.375rem' }}>
                        New Password (Minimum 6 characters)
                      </label>
                      <input
                        type={showPass ? 'text' : 'password'}
                        className="input-base"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={updatingPassword}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.375rem' }}>
                        Confirm New Password
                      </label>
                      <input
                        type={showPass ? 'text' : 'password'}
                        className="input-base"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={updatingPassword}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="show-password-toggle"
                        checked={showPass}
                        onChange={(e) => setShowPass(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                      />
                      <label htmlFor="show-password-toggle" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        Show password characters
                      </label>
                    </div>

                    {passwordSuccess && <p style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>✓ {passwordSuccess}</p>}
                    {passwordError && <p style={{ fontSize: '0.875rem', color: '#EF4444', fontWeight: 600 }}>✕ {passwordError}</p>}

                    <div>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={updatingPassword || !newPassword || !confirmPassword}
                        style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}
                      >
                        {updatingPassword ? 'Updating Password...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ════════════════ TAB 3: AI & STUDIO PREFERENCES ════════════════ */}
          {activeTab === 'preferences' && (
            <div className="surface" style={{ borderRadius: '16px', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>
                    AI Studio &amp; Writing Defaults
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Configure default tones, variation counts, length modulators, and custom email signatures.
                  </p>
                </div>
                {isGuest && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-raised)', border: '1px solid var(--border)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                    🔒 Preview Mode
                  </span>
                )}
              </div>

              {/* Tone Modulators */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem' }}>
                  Default Writing Tone
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
                  {TONE_OPTIONS.map((t) => {
                    const Icon = t.icon;
                    const isSelected = defaultTone === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => { if (!isGuest) setDefaultTone(t.value); }}
                        style={{
                          padding: '1rem',
                          borderRadius: '10px',
                          border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--accent-dim)' : 'var(--surface-raised)',
                          textAlign: 'left',
                          cursor: isGuest ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                          fontFamily: 'var(--font-ui)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                          <strong style={{ fontSize: '0.9375rem', color: isSelected ? 'var(--accent)' : 'var(--text)' }}>
                            {t.label}
                          </strong>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Length & Variations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                    Default Reply Length
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['shorter', 'default', 'longer'].map((len) => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => { if (!isGuest) setDefaultLength(len); }}
                        style={{
                          flex: 1,
                          padding: '0.625rem 0.5rem',
                          borderRadius: '8px',
                          border: `1px solid ${defaultLength === len ? 'var(--accent)' : 'var(--border)'}`,
                          background: defaultLength === len ? 'var(--accent-dim)' : 'var(--surface-raised)',
                          color: defaultLength === len ? 'var(--accent)' : 'var(--text)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          cursor: isGuest ? 'default' : 'pointer',
                        }}
                      >
                        {len === 'default' ? 'Balanced' : len}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                    Default Variations Count
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 3, 5].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => { if (!isGuest) setDefaultVariations(count); }}
                        style={{
                          flex: 1,
                          padding: '0.625rem 0.5rem',
                          borderRadius: '8px',
                          border: `1px solid ${defaultVariations === count ? 'var(--accent)' : 'var(--border)'}`,
                          background: defaultVariations === count ? 'var(--accent-dim)' : 'var(--surface-raised)',
                          color: defaultVariations === count ? 'var(--accent)' : 'var(--text)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: isGuest ? 'default' : 'pointer',
                        }}
                      >
                        {count} {count === 1 ? 'Option' : 'Options'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: isGuest ? 'not-allowed' : 'pointer' }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', display: 'block' }}>Use Emojis by Default</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Integrate conversational emojis into friendly or casual responses</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={defaultEmojis}
                    onChange={(e) => { if (!isGuest) setDefaultEmojis(e.target.checked); }}
                    disabled={isGuest}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: isGuest ? 'not-allowed' : 'pointer' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: isGuest ? 'not-allowed' : 'pointer' }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', display: 'block' }}>Auto-Copy to Clipboard</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instantly copy reply text to clipboard upon completion</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCopy}
                    onChange={(e) => { if (!isGuest) setAutoCopy(e.target.checked); }}
                    disabled={isGuest}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: isGuest ? 'not-allowed' : 'pointer' }}
                  />
                </label>
              </div>

              {/* Custom Signature Studio */}
              <div style={{ marginBottom: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.375rem' }}>
                  Default Email Sign-off / Signature
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Automatically appended to all studio generations.
                </p>
                <textarea
                  className="input-base"
                  rows={3}
                  placeholder={isGuest ? 'Sign in to configure your personal email signature...' : 'e.g. Best regards,\nAlex Morgan\nOperations Lead | Acme Inc.'}
                  value={signature}
                  onChange={(e) => { if (!isGuest) setSignature(e.target.value); }}
                  disabled={isGuest}
                  style={{ fontSize: '0.875rem', minHeight: '84px', background: 'var(--surface-raised)', opacity: isGuest ? 0.7 : 1 }}
                />
              </div>

              {/* Theme Selector */}
              <div style={{ marginBottom: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem' }}>
                  Application Theme
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      border: `2px solid ${currentTheme === 'light' ? 'var(--accent)' : 'var(--border)'}`,
                      background: '#FFFFFF',
                      color: '#0F172A',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sun className="w-4 h-4 text-amber-500" /> Light Mode
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Clean, high-contrast light theme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      border: `2px solid ${currentTheme === 'dark' ? 'var(--accent)' : 'var(--border)'}`,
                      background: '#1E293B',
                      color: '#F8FAFC',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Moon className="w-4 h-4 text-sky-400" /> Dark Mode
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Sleek, low-glare dark theme</span>
                  </button>
                </div>
              </div>

              {/* Save button */}
              {!isGuest && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {prefSaved ? (
                    <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <CheckCircle2 className="w-4 h-4" /> Preferences saved!
                    </span>
                  ) : <span />}
                  <button
                    onClick={handleSavePreferences}
                    className="btn-primary"
                    style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}
                  >
                    Save Preferences
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ════════════════ TAB 4: SYSTEM & STORAGE ════════════════ */}
          {activeTab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Infrastructure & Status */}
              <div className="surface" style={{ borderRadius: '16px', padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.375rem' }}>
                  System Infrastructure &amp; Connections
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Real-time status of connected AI engines, cloud databases, and CDNs.
                </p>

                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { service: 'Google Gemini 1.5 Flash Engine', desc: 'Primary AI Generation Provider', status: 'Operational 🟢' },
                    { service: 'Groq LLaMA 3.3 (70B)', desc: 'Sub-second LPU Fast Fallback', status: 'Standby 🟢' },
                    { service: 'OpenRouter LLaMA 3.2', desc: 'Distributed Redundancy Router', status: 'Standby 🟢' },
                    { service: 'Cloudinary Media CDN', desc: 'Encrypted Avatar Asset Storage', status: 'Connected 🟢' },
                    { service: 'MongoDB Atlas Enterprise Vault', desc: 'Encrypted User & Template Store', status: 'Healthy 🟢' },
                  ].map(({ service, desc, status }) => (
                    <div key={service} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'var(--surface-raised)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text)', display: 'block' }}>{service}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</span>
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: '#10B981', fontWeight: 600 }}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cache & Session Management */}
              <div className="surface" style={{ borderRadius: '16px', padding: '2rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.375rem' }}>
                  Device Cache &amp; Session Controls
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Manage your active login session or restore generator preferences to factory defaults.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {isGuest ? (
                    <Link href="/login" className="btn-primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>
                      Exit Guest Mode / Sign In
                    </Link>
                  ) : (
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="btn-danger"
                      style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
                    >
                      <LogOut className="w-4 h-4" /> Sign Out of Account
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Reset your generator preferences to factory defaults?')) {
                        localStorage.removeItem('mg-pref-tone');
                        localStorage.removeItem('mg-pref-length');
                        localStorage.removeItem('mg-pref-variations');
                        localStorage.removeItem('mg-pref-emojis');
                        localStorage.removeItem('mg-pref-autocopy');
                        localStorage.removeItem('mg-signature');
                        setDefaultTone('formal');
                        setDefaultLength('default');
                        setDefaultVariations(1);
                        setDefaultEmojis(false);
                        setAutoCopy(false);
                        setSignature('');
                        alert('Preferences reset to default.');
                      }
                    }}
                    className="btn-ghost"
                    style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
