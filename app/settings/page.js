'use client';

import { useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [avatar, setAvatar] = useState(null); // File object
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef(null);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  function handleFileChange(e) {
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
    if (!avatar) return;
    setUploadingAvatar(true);
    setAvatarSuccess('');
    setAvatarError('');

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      const res = await fetch('/api/user/avatar', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setAvatarSuccess('Profile picture updated! It will refresh on your next sign in.');
      setAvatar(null);
      // Update the session with new image
      await update({ image: data.url });
    } catch (err) {
      setAvatarError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
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

  const currentImage = avatarPreview || user?.image;

  return (
    <div className="page-wrap" style={{ maxWidth: '720px' }}>
      <h1 className="display-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Settings</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Manage your account preferences.</p>

      {/* ── Profile Section ─────────────────────────────────────────────────── */}
      <section className="surface" style={{ borderRadius: '12px', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', marginBottom: '1.5rem', color: 'var(--text)' }}>
          Profile Picture
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar preview */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: currentImage ? 'transparent' : 'var(--accent)',
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', border: '3px solid var(--border)', flexShrink: 0,
              position: 'relative', transition: 'opacity 0.2s',
            }}
            title="Click to change photo"
          >
            {currentImage ? (
              <img src={currentImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{initials}</span>
            )}
          </div>

          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
              {user?.name || 'User'}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-ghost"
                style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}
                id="btn-choose-photo"
              >
                {avatar ? 'Change Photo' : 'Upload Photo'}
              </button>
              {(currentImage || avatar) && (
                <button
                  onClick={handleRemoveAvatar}
                  className="btn-ghost"
                  disabled={uploadingAvatar}
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                  id="btn-remove-photo"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* File input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          id="input-avatar-file"
        />

        {/* Preview + upload confirm */}
        {avatar && (
          <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--surface-raised)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', flex: 1 }}>
              <strong style={{ color: 'var(--text)' }}>{avatar.name}</strong>
              <span style={{ marginLeft: '0.5rem' }}>({(avatar.size / 1024).toFixed(0)} KB)</span>
            </div>
            <button
              className="btn-primary"
              onClick={handleAvatarUpload}
              disabled={uploadingAvatar}
              style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
              id="btn-save-avatar"
            >
              {uploadingAvatar ? <><div className="spinner" />Uploading...</> : '✓ Save Photo'}
            </button>
          </div>
        )}

        {avatarSuccess && (
          <p style={{ marginTop: '0.875rem', fontSize: '0.875rem', color: 'var(--success)', fontWeight: 500 }}>✓ {avatarSuccess}</p>
        )}
        {avatarError && (
          <p style={{ marginTop: '0.875rem', fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 500 }}>✕ {avatarError}</p>
        )}

        <p style={{ marginTop: '0.875rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          Supported formats: JPEG, PNG, WebP · Max size: 5 MB · Stored on Cloudinary CDN
        </p>
      </section>

      {/* ── Account Info ────────────────────────────────────────────────────── */}
      <section className="surface" style={{ borderRadius: '12px', padding: '1.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', marginBottom: '1.25rem', color: 'var(--text)' }}>
          Account Info
        </h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {[
            { label: 'Name', value: user?.name || '—' },
            { label: 'Email', value: user?.email || '—' },
            { label: 'Sign-in method', value: session?.provider === 'credentials' ? 'Email & Password' : (session?.provider || 'Unknown') },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--surface-raised)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Danger Zone ─────────────────────────────────────────────────────── */}
      <section className="surface" style={{ borderRadius: '12px', padding: '1.75rem', border: '1px solid rgba(192,69,90,0.2)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>
          Sign Out
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          You will be signed out and redirected to the login page.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn-ghost"
          style={{ color: 'var(--accent)', borderColor: 'var(--accent)', fontSize: '0.875rem' }}
          id="btn-settings-signout"
        >
          Sign Out
        </button>
      </section>
    </div>
  );
}
