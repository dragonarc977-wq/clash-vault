import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const currencies = [
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
];

const UserIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M19 20a7 7 0 0 0-14 0m11-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /></svg>;
const WalletIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M4 6.5h15.5v12H4v-12Zm0 3h15.5M15 14h2" /></svg>;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [publicId, setPublicId] = useState(null);
  const [currency, setCurrency] = useState('INR');
  const [avatarUploading, setAvatarUploading] = useState(false);
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
      const savedCurrency = buyer.user_metadata?.currency || localStorage.getItem('clashvault_currency') || 'INR';
      const { data: permanentId } = await supabase.rpc('get_my_public_id');
      if (!active) return;
      setUser(buyer);
      setPublicId(permanentId);
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

    setSaving(true);
    const { data, error: updateError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        currency,
      },
    });
    setSaving(false);

    if (updateError) {
      setError(updateError.message || 'We could not save your changes. Please try again.');
      return;
    }

    setUser(data.user);
    localStorage.setItem('clashvault_currency', currency);
    window.dispatchEvent(new CustomEvent('clashvault-preferences', { detail: { currency } }));
    setMessage('Your account settings have been saved.');
  };

  const uploadProfilePicture = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError(''); setMessage('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Profile picture must be JPG, PNG or WebP and smaller than 2 MB.');
      return;
    }
    setAvatarUploading(true);
    const path = `${user.id}/profile-picture`;
    const bucket = supabase.storage.from('profile-avatars');
    const { error: uploadError } = await bucket.upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
    if (uploadError) { setError(uploadError.message); setAvatarUploading(false); return; }
    const avatarUrl = `${bucket.getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
    const { data, error: updateError } = await supabase.auth.updateUser({ data: { ...user.user_metadata, avatar_url: avatarUrl } });
    if (!updateError) {
      await Promise.all([
        supabase.from('user_profiles').update({ avatar_url: avatarUrl }).eq('user_id', user.id),
        supabase.from('seller_profiles').update({ avatar_url: avatarUrl }).eq('user_id', user.id),
      ]);
    }
    if (updateError) setError(updateError.message);
    else { setUser(data.user); setMessage('Profile picture updated.'); }
    setAvatarUploading(false);
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

          <div className="mt-7 flex items-center gap-4 rounded-2xl bg-zinc-50 p-4">
            <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-zinc-950 text-2xl font-black text-white">{user?.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" /> : displayName.charAt(0).toUpperCase()}</span>
            <div><p className="text-sm font-black">Profile picture</p><p className="mt-1 text-xs text-zinc-500">JPG, PNG or WebP · maximum 2 MB</p><label className="mt-3 inline-flex cursor-pointer rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white"><span>{avatarUploading ? 'Uploading…' : user?.user_metadata?.avatar_url ? 'Change picture' : 'Set up picture'}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={avatarUploading} onChange={uploadProfilePicture} className="sr-only" /></label></div>
          </div>

          <div className="mt-6 space-y-6">
            <label className="block">
              <span className="text-sm font-bold text-zinc-800">Email address</span>
              <input value={user?.email || ''} readOnly className="mt-2 h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base text-zinc-500 outline-none" />
              <span className="mt-2 block text-xs text-zinc-400">Your sign-in email cannot be changed here.</span>
            </label>
            <div className="block">
              <span className="text-sm font-bold text-zinc-800">User ID</span>
              <div className="mt-2 flex h-14 items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4">
                <span className="mr-2 text-sm font-bold text-zinc-400">ID</span>
                <span className="text-base font-black tabular-nums tracking-[0.08em] text-zinc-900">{publicId || '••••••'}</span>
              </div>
              <span className="mt-2 block text-xs text-zinc-400">Your permanent account ID is assigned automatically and cannot be changed.</span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
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
