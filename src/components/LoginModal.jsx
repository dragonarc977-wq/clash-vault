'use client';

import '../styles/loginmodal.css';
import { useEffect, useState } from 'react';
import { useNavigate } from '../lib/navigation';
import supabase from '../lib/supabase';

const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
  </svg>
);

const COPY = {
  signin: {
    heading: 'Login',
    action: 'Login',
  },
  signup: {
    heading: 'Sign Up',
    action: 'SignUp',
  },
  forgot: {
    heading: 'Reset password',
    action: 'Send reset link',
  },
  reset: {
    heading: 'New password',
    action: 'Update password',
  },
};

// Reads a safe same-origin "?next=" redirect target, same guard logic the
// old Login.jsx page used. Returns null when there's nothing to redirect to.
function getSafeNextDestination() {
  if (typeof window === 'undefined') {
    return null;
  }

  const requestedPath = new URLSearchParams(window.location.search).get('next');

  if (!requestedPath?.startsWith('/') || requestedPath.startsWith('//') || requestedPath.includes('\\')) {
    return null;
  }

  const destination = new URL(requestedPath, window.location.origin);

  if (destination.origin !== window.location.origin) {
    return null;
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}

export default function LoginModal({ isOpen, onClose, initialMode = 'signin' }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

 

  // Lock page scroll while the modal is open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleGoogle = async () => {
    setError('');

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (googleError) {
      setError(googleError.message);
    }
  };

  const resetFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      /* =========================================
         SIGN IN
      ========================================= */
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        const nextDestination = getSafeNextDestination();

        resetFields();
        onClose();

        if (nextDestination) {
          navigate(nextDestination);
        }

        return;
      }

      /* =========================================
         SIGN UP
      ========================================= */
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;

        switchMode('signin');
        setNotice('Account created. Confirm your email if asked, then log in.');
        return;
      }

      /* =========================================
         FORGOT PASSWORD
      ========================================= */
      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        });

        if (resetError) throw resetError;

        setNotice('Reset link sent. Check your inbox and spam folder.');
        return;
      }

      /* =========================================
         UPDATE PASSWORD (mode === 'reset')
      ========================================= */
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      switchMode('signin');
      setNotice('Password updated. Log in with your new password.');
    } catch (submitError) {
      setError(submitError?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const copy = COPY[mode];
  const isToggleMode = mode === 'signin' || mode === 'signup';

  return (
    <div
      className="auth-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="auth-modal-card" role="dialog" aria-modal="true" aria-label={copy.heading}>
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h1 className="auth-modal-heading">{copy.heading}</h1>

        {isToggleMode && (
          <div className="auth-toggle" role="tablist">
            <span
              className="auth-toggle-thumb"
              style={{ transform: mode === 'signup' ? 'translateX(100%)' : 'translateX(0%)' }}
              aria-hidden="true"
            />
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              className={`auth-toggle-option${mode === 'signin' ? ' auth-toggle-option-active' : ''}`}
              onClick={() => switchMode('signin')}
            >
              Login
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={`auth-toggle-option${mode === 'signup' ? ' auth-toggle-option-active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              Sign Up
            </button>
          </div>
        )}

        {error && (
          <div role="alert" className="auth-modal-alert auth-modal-alert-error">
            {error}
          </div>
        )}

        {notice && (
          <div role="status" className="auth-modal-alert auth-modal-alert-notice">
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-modal-form">
          {mode === 'signup' && (
            <label className="auth-field">
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name"
                aria-label="Name"
                className="auth-input"
              />
            </label>
          )}

          {mode !== 'reset' && (
            <label className="auth-field">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email Address"
                aria-label="Email Address"
                className="auth-input"
              />
            </label>
          )}

          {mode !== 'forgot' && (
            <label className="auth-field">
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === 'reset' ? 'New password' : 'Password'}
                aria-label={mode === 'reset' ? 'New password' : 'Password'}
                className="auth-input"
              />
            </label>
          )}

          {mode === 'signup' && (
            <label className="auth-field">
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm Password"
                aria-label="Confirm Password"
                className="auth-input"
              />
            </label>
          )}

          {mode === 'signin' && (
            <button type="button" onClick={() => switchMode('forgot')} className="auth-forgot-link">
              Forget password
            </button>
          )}

          <button type="submit" disabled={loading} className="auth-submit-button">
            {loading ? 'Please wait…' : copy.action}
          </button>
        </form>

        {mode === 'signin' && (
          <>
            <div className="auth-divider">
              <span className="auth-divider-line" />
              <span>or</span>
              <span className="auth-divider-line" />
            </div>

            <button type="button" onClick={handleGoogle} className="auth-google-button">
              <GoogleLogo />
              <span>Continue with Google</span>
            </button>
          </>
        )}

        <p className="auth-modal-switch">
          {mode === 'signin' && (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" className="auth-switch-link" onClick={() => switchMode('signup')}>
                Sign up now
              </button>
            </>
          )}

          {mode === 'signup' && (
            <>
              Already have an account?{' '}
              <button type="button" className="auth-switch-link" onClick={() => switchMode('signin')}>
                Login
              </button>
            </>
          )}

          {(mode === 'forgot' || mode === 'reset') && (
            <button type="button" className="auth-switch-link" onClick={() => switchMode('signin')}>
              Back to login
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
