import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from './lib/supabase';

const GoogleLogo = () => (
  <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
  </svg>
);

const MarkIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 10a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2l1 6a2 2 0 0 1-3.46 1.37L14 16h-4l-1.54 1.37A2 2 0 0 1 5 16l1-6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 11v2M8 12h2M15.5 11.5h.01M17.5 13h.01" />
  </svg>
);

const COPY = {
  signin: { heading: 'Welcome back', sub: 'Sign in to your AllGamersMarket account.', action: 'Log in' },
  signup: { heading: 'Create your account', sub: 'Join AllGamersMarket in a few seconds.', action: 'Create account' },
  forgot: { heading: 'Reset your password', sub: "We'll email you a link to get back in.", action: 'Send reset link' },
  reset: { heading: 'Set a new password', sub: 'Choose a password you have not used before.', action: 'Update password' },
};

export default function Login() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Supabase fires PASSWORD_RECOVERY when the user lands here from the reset email.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
        setError('');
        setNotice('');
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setNotice('');
    setPassword('');
  };

  const handleGoogle = async () => {
    setError('');
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (googleError) setError(googleError.message);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        window.location.href = '/';
        return;
      }

      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (signUpError) throw signUpError;
        setMode('signin');
        setPassword('');
        setNotice('Account created. Confirm your email if asked, then log in.');
        return;
      }

      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (resetError) throw resetError;
        setNotice('Reset link sent. Check your inbox and spam folder.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMode('signin');
      setPassword('');
      setNotice('Password updated. Log in with your new password.');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = COPY[mode];
  const showSocial = mode === 'signin' || mode === 'signup';
  const showEmail = mode !== 'reset';
  const showPassword = mode !== 'forgot';

  const inputClass =
    'h-12 w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/20';

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_0%,#152238,#05070d_65%)] px-5 py-10 text-white">
      <div className="w-full max-w-md">
        <section className="rounded-3xl border border-white/10 bg-slate-900/90 p-7 shadow-2xl shadow-black/40 backdrop-blur sm:p-9">
          <div className="flex flex-col items-center text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <MarkIcon />
            </span>
            <h1 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">{copy.heading}</h1>
            <p className="mt-1.5 text-sm text-slate-400">{copy.sub}</p>
          </div>

          {error && (
            <div role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {notice && (
            <div role="status" className="mt-6 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
              {notice}
            </div>
          )}

          {showSocial && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                <GoogleLogo />
                Continue with Google
              </button>

              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
                <span className="h-px flex-1 bg-white/10" />
                or
                <span className="h-px flex-1 bg-white/10" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className={`space-y-3 ${showSocial ? '' : 'mt-6'}`}>
            {showEmail && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-300">Email address</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </label>
            )}

            {showPassword && (
              <label className="block">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">
                    {mode === 'reset' ? 'New password' : 'Password'}
                  </span>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={inputClass}
                />
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? '#3b5c9e' : '#2563eb' }}
              className="mt-2 h-12 w-full rounded-full text-sm font-semibold text-white transition hover:!bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait…' : copy.action}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            {mode === 'signin' && (
              <button type="button" onClick={() => switchMode('signup')} className="hover:text-white">
                New here? <span className="font-semibold text-blue-400">Create an account</span>
              </button>
            )}
            {mode === 'signup' && (
              <button type="button" onClick={() => switchMode('signin')} className="hover:text-white">
                Already have an account? <span className="font-semibold text-blue-400">Log in</span>
              </button>
            )}
            {(mode === 'forgot' || mode === 'reset') && (
              <button type="button" onClick={() => switchMode('signin')} className="font-semibold text-blue-400 hover:text-blue-300">
                Back to login
              </button>
            )}
          </div>
        </section>

        <p className="mt-5 text-center text-sm text-slate-500">
          <Link to="/" className="transition hover:text-white">
            Back to marketplace
          </Link>
        </p>
      </div>
    </main>
  );
}
