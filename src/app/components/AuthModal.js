'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export default function AuthModal({ mode: initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const clearMessages = () => { setError(null); setSuccess(null); };

  /* ── Email / Password ─────────────────────────────────────────── */
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Check your email to confirm your account!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── OAuth ────────────────────────────────────────────────────── */
  const handleOAuth = useCallback(async (provider) => {
    setLoading(true);
    clearMessages();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setLoading(false); }
  }, []);

  return (
    /* Backdrop */
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="auth-modal-header">
          <h2 className="auth-modal-title">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <button className="auth-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* OAuth buttons */}
        <div className="auth-oauth-row">
          <button
            className="auth-oauth-btn"
            onClick={() => handleOAuth('google')}
            disabled={loading}
          >
            {/* Google SVG */}
            <svg viewBox="0 0 488 512" className="auth-oauth-icon">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
            </svg>
            Continue with Google
          </button>
          <button
            className="auth-oauth-btn"
            onClick={() => handleOAuth('apple')}
            disabled={loading}
          >
            {/* Apple SVG */}
            <svg viewBox="0 0 384 512" className="auth-oauth-icon">
              <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        <div className="auth-divider"><span>or</span></div>

        {/* Email / Password form */}
        <form className="auth-form" onSubmit={handleEmailAuth}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {error   && <p className="auth-msg auth-msg--error">{error}</p>}
          {success && <p className="auth-msg auth-msg--success">{success}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Loading…' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="auth-toggle">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="auth-toggle-btn"
            onClick={() => { clearMessages(); setMode(mode === 'login' ? 'signup' : 'login'); }}
          >
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>

      </div>
    </div>
  );
}
