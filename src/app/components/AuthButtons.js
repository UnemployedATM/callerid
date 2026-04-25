'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const AuthModal = dynamic(() => import('./AuthModal'), { ssr: false });

export default function AuthButtons() {
  const [modal, setModal] = useState(null); // null | 'login' | 'signup'

  return (
    <>
      <div className="auth-grid">
        {/* Log In */}
        <button
          id="auth-login-btn"
          className="auth-btn auth-icon-btn"
          title="Log In"
          onClick={() => setModal('login')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
        </button>

        {/* Sign Up */}
        <button
          id="auth-signup-btn"
          className="auth-btn auth-icon-btn auth-primary"
          title="Sign Up"
          onClick={() => setModal('signup')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
        </button>

        {/* Apple */}
        <button
          id="auth-apple-btn"
          className="auth-btn auth-icon-btn"
          title="Continue with Apple"
          onClick={() => setModal('login')}
        >
          <svg viewBox="0 0 384 512" width="100%" height="100%">
            <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
          </svg>
        </button>

        {/* Google */}
        <button
          id="auth-google-btn"
          className="auth-btn auth-icon-btn"
          title="Continue with Google"
          onClick={() => setModal('login')}
        >
          <svg viewBox="0 0 488 512" width="100%" height="100%">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
          </svg>
        </button>
      </div>

      {modal && (
        <AuthModal mode={modal} onClose={() => setModal(null)} />
      )}
    </>
  );
}
