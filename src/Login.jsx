import { useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from './lib/supabase';

const ShieldIcon = () => <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M12 3 5.5 5.5v5.2c0 4.2 2.7 8.1 6.5 10.3 3.8-2.2 6.5-6.1 6.5-10.3V5.5L12 3Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="m9.2 12 1.8 1.8 3.9-4" /></svg>;
const ArrowIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 18 6-6-6-6" /></svg>;

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) setErrorMessage(error.message);
  };

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        setSuccessMessage('Account created. You can now sign in with your password.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/';
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp((current) => !current);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return <main className="min-h-screen bg-white px-5 pb-16 pt-24 text-zinc-950 sm:px-8 sm:pb-20 sm:pt-28">
    <div className="mx-auto max-w-5xl">
      <div className="mb-7 text-center sm:mb-9">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">Buyer account</p>
        <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] sm:text-4xl">{isSignUp ? 'Create your account.' : 'Welcome back.'}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">Sign in to manage your orders, balance, notifications and support.</p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between bg-zinc-950 p-7 text-white sm:p-10">
          <div>
            <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10"><ShieldIcon /></span>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">ClashVault access</p>
            <h2 className="mt-3 max-w-sm text-2xl font-black tracking-[-0.035em] sm:text-3xl">Everything you buy, in one secure place.</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">Access purchases, account delivery and buyer support from your personal dashboard.</p>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-center">
            <div><p className="text-sm font-black">Secure</p><p className="mt-1 text-[10px] text-zinc-500">Account</p></div>
            <div className="border-x border-white/10"><p className="text-sm font-black">Simple</p><p className="mt-1 text-[10px] text-zinc-500">Access</p></div>
            <div><p className="text-sm font-black">Private</p><p className="mt-1 text-[10px] text-zinc-500">Details</p></div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-7">
            <h2 className="text-2xl font-black tracking-[-0.035em]">{isSignUp ? 'Join ClashVault' : 'Sign in to ClashVault'}</h2>
            <p className="mt-2 text-sm text-zinc-500">{isSignUp ? 'Use Google or create an account with your email.' : 'Continue with Google or enter your account details.'}</p>
          </div>

          {errorMessage && <div role="alert" className="mb-5 rounded-2xl border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900">{errorMessage}</div>}
          {successMessage && <div role="status" className="mb-5 rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm">{successMessage}</div>}

          <button onClick={handleGoogleLogin} type="button" className="flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-zinc-300 bg-white px-5 text-sm font-bold transition hover:border-zinc-950 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2">
            <span className="grid h-7 w-7 place-items-center rounded-full border border-zinc-300 text-xs font-black">G</span>
            Continue with Google
          </button>

          <div className="my-7 flex items-center gap-4"><span className="h-px flex-1 bg-zinc-200" /><span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">Email and password</span><span className="h-px flex-1 bg-zinc-200" /></div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-zinc-700">Email address</span>
              <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="h-13 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-zinc-700">Password</span>
              <input type="password" required minLength="6" autoComplete={isSignUp ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" className="h-13 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10" />
            </label>
            <button type="submit" disabled={loading} className="flex h-13 w-full items-center justify-center rounded-2xl bg-zinc-950 px-5 text-sm font-black text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}</button>
          </form>

          <button type="button" onClick={switchMode} className="mt-5 w-full text-center text-sm font-semibold text-zinc-600 transition hover:text-zinc-950">{isSignUp ? 'Already have an account? Sign in' : 'New to ClashVault? Create an account'}</button>

          <div className="mt-8 border-t border-zinc-200 pt-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 transition hover:text-zinc-950"><span className="rotate-180"><ArrowIcon /></span>Back to marketplace</Link>
          </div>
        </div>
      </section>
    </div>
  </main>;
}
