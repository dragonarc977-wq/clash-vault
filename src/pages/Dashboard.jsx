import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const languages = [
  { value: 'EN', label: 'English' },
  { value: 'ZH', label: 'Chinese' },
  { value: 'HI', label: 'Hindi' },
  { value: 'FR', label: 'French' },
  { value: 'NL', label: 'Dutch' },
  { value: 'PT-BR', label: 'Brazilian Portuguese' },
];

const currencies = [
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
];

const UserIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M19 20a7 7 0 0 0-14 0m11-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /></svg>;
const GlobeIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="1.7" /><path strokeLinecap="round" strokeWidth="1.7" d="M3.5 12h17M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" /></svg>;
const WalletIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M4 6.5h15.5v12H4v-12Zm0 3h15.5M15 14h2" /></svg>;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState('');
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadBuyer = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.user) {
        navigate('/login');
        return;
      }

      const buyer = session.user;
      const savedLanguage = buyer.user_metadata?.language || localStorage.getItem('clashvault_language') || 'EN';
      const savedCurrency = buyer.user_metadata?.currency || localStorage.getItem('clashvault_currency') || 'INR';
      setUser(buyer);
      setUserId(buyer.user_metadata?.username || '');
      setLanguage(savedLanguage);
      setCurrency(savedCurrency);
      setLoading(false);
    };
    loadBuyer();
    return () => { active = false; };
  }, [navigate]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const cleanUserId = userId.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUserId)) {
      setError('User ID must be 3–20 characters and use only letters, numbers, or underscores.');
      return;
    }

    setSaving(true);
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        username: cleanUserId,
        language,
        currency,
      },
    });
    setSaving(false);

    if (updateError) {
      setError(updateError.message || 'We could not save your changes. Please try again.');
      return;
    }

    setUser(data.user);
    localStorage.setItem('clashvault_language', language);
    localStorage.setItem('clashvault_currency', currency);
    window.dispatchEvent(new CustomEvent('clashvault-preferences', { detail: { language, currency } }));
    setMessage('Your account settings have been saved.');
  };

  if (loading) return <main className="min-h-screen bg-zinc-50 px-5 pt-28 text-zinc-950"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-10 w-64 rounded-xl bg-zinc-200" /><div className="mt-8 h-72 rounded-3xl bg-white" /></div></main>;

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Buyer';

  return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-28 text-zinc-950 sm:px-8">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b77e00]">Buyer account</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-5xl">Welcome, {displayName}</h1>
          <p className="mt-3 text-sm text-zinc-500 sm:text-base">Manage your identity and marketplace preferences.</p>
        </div>
        <Link to="/my-orders" className="inline-flex w-fit items-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-bold shadow-sm transition hover:border-zinc-300 hover:shadow-md">View my orders <span className="ml-2">→</span></Link>
      </div>

      <form onSubmit={saveProfile} className="mt-9 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-100 text-[#9a6a00]"><UserIcon /></span>
            <div><h2 className="text-xl font-black tracking-tight sm:text-2xl">Account details</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Your buyer identity on ClashVault.</p></div>
          </div>

          <div className="mt-8 space-y-6">
            <label className="block">
              <span className="text-sm font-bold text-zinc-800">Email address</span>
              <input value={user?.email || ''} readOnly className="mt-2 h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base text-zinc-500 outline-none" />
              <span className="mt-2 block text-xs text-zinc-400">Your sign-in email cannot be changed here.</span>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-zinc-800">User ID</span>
              <div className="mt-2 flex h-14 items-center rounded-2xl border border-zinc-200 bg-white px-4 transition focus-within:border-[#c68d00] focus-within:ring-4 focus-within:ring-yellow-100">
                <span className="mr-1 text-zinc-400">@</span>
                <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="choose_your_id" maxLength={20} className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:font-normal placeholder:text-zinc-400" />
              </div>
              <span className="mt-2 block text-xs text-zinc-400">Use 3–20 letters, numbers, or underscores.</span>
            </label>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-100 text-[#9a6a00]"><GlobeIcon /></span>
            <div><h2 className="text-xl font-black tracking-tight sm:text-2xl">Language</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Choose how you want to browse the marketplace.</p></div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {languages.map((option) => <button key={option.value} type="button" onClick={() => setLanguage(option.value)} className={`min-h-16 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${language === option.value ? 'border-zinc-950 bg-zinc-950 text-white shadow-lg' : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'}`}><span className="block text-[10px] font-black tracking-wider opacity-60">{option.value}</span><span className="mt-1 block">{option.label}</span></button>)}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-100 text-[#9a6a00]"><WalletIcon /></span>
            <div><h2 className="text-xl font-black tracking-tight sm:text-2xl">Currency</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Prices will be shown in your preferred currency.</p></div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {currencies.map((option) => <button key={option.value} type="button" onClick={() => setCurrency(option.value)} className={`flex min-h-24 items-center gap-4 rounded-2xl border p-5 text-left transition ${currency === option.value ? 'border-[#c68d00] bg-yellow-50 ring-4 ring-yellow-100' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}><span className={`grid h-12 w-12 place-items-center rounded-xl text-xl font-black ${currency === option.value ? 'bg-yellow-300 text-zinc-950' : 'bg-zinc-100 text-zinc-600'}`}>{option.symbol}</span><span><span className="block text-base font-black">{option.value}</span><span className="mt-1 block text-sm text-zinc-500">{option.label}</span></span><span className={`ml-auto h-5 w-5 rounded-full border-2 ${currency === option.value ? 'border-[#c68d00] bg-[#c68d00] ring-4 ring-yellow-100' : 'border-zinc-300'}`} /></button>)}
          </div>
        </section>

        <div className="lg:col-span-2">
          {error && <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</p>}
          {message && <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">{message}</p>}
          <button disabled={saving} className="w-full rounded-2xl bg-zinc-950 px-6 py-4 text-base font-black text-white shadow-lg transition hover:bg-[#b77e00] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48">{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  </main>;
}
