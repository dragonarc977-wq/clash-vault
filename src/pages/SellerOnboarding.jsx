import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const categories = ['Accounts', 'Items', 'Top-ups', 'Services'];
const inputClass = 'mt-2 h-13 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-100';

export default function SellerOnboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selected, setSelected] = useState(['Accounts']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      const { data } = await supabase.from('seller_profiles').select('*').eq('user_id', session.user.id).maybeSingle();
      if (!active) return;
      setUser(session.user);
      setProfile(data);
      if (data?.categories?.length) setSelected(data.categories);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [navigate]);

  async function submit(event) {
    event.preventDefault();
    if (!selected.length) { setError('Choose at least one category.'); return; }
    const form = event.currentTarget;
    setSaving(true); setError('');
    const payload = {
      user_id: user.id,
      display_name: form.displayName.value.trim(), legal_name: form.legalName.value.trim(),
      email: user.email, phone: form.phone.value.trim(), country: form.country.value.trim(),
      categories: selected, experience: form.experience.value.trim() || null,
    };
    const { data, error: saveError } = await supabase.from('seller_profiles').upsert(payload, { onConflict: 'user_id' }).select('*').single();
    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    setProfile(data);
  }

  if (loading) return <main className="min-h-screen bg-zinc-50 px-5 pt-28"><div className="mx-auto h-96 max-w-4xl animate-pulse rounded-3xl bg-white" /></main>;

  if (profile && profile.status !== 'rejected') {
    const approved = profile.status === 'approved';
    return <main className="grid min-h-screen place-items-center bg-zinc-50 px-5 pb-16 pt-24 text-zinc-950"><section className="w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white p-7 text-center shadow-sm sm:p-12"><span className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl text-2xl ${approved ? 'bg-emerald-50 text-emerald-600' : profile.status === 'suspended' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{approved ? '✓' : '⌛'}</span><p className="mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Seller application</p><h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">{approved ? 'You are an approved seller' : profile.status === 'suspended' ? 'Seller account suspended' : 'Application under review'}</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500">{approved ? 'Your seller workspace is ready. Create listings, follow their review status, manage sales and request withdrawals.' : profile.status === 'suspended' ? 'Contact support for information about your seller account.' : 'Our team will review your details. You cannot publish listings or request withdrawals until approval.'}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{approved && <Link to="/seller" className="rounded-full bg-zinc-950 px-7 py-3.5 text-sm font-black text-white">Open seller dashboard</Link>}<Link to="/support" className="rounded-full border border-zinc-300 px-7 py-3.5 text-sm font-bold">Contact support</Link></div></section></main>;
  }

  return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-28 text-zinc-950 sm:px-8"><div className="mx-auto max-w-5xl"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a87300]">Sell on ClashVault</p><h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">Become a verified seller</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500">Submit your details for manual review. Approval is required before any listing can appear in the marketplace.</p>
    {profile?.status === 'rejected' && <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><b>Your previous application was not approved.</b><p className="mt-1">{profile.admin_notes || 'Update your information and submit it again.'}</p></div>}
    <form onSubmit={submit} className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-9"><div className="grid gap-6 sm:grid-cols-2"><label className="text-sm font-bold">Seller display name *<input name="displayName" required maxLength="40" defaultValue={profile?.display_name || user?.user_metadata?.username || ''} placeholder="Shown to buyers" className={inputClass} /></label><label className="text-sm font-bold">Legal name *<input name="legalName" required maxLength="80" defaultValue={profile?.legal_name || user?.user_metadata?.full_name || ''} placeholder="As shown on your ID" className={inputClass} /></label><label className="text-sm font-bold">Account email<input value={user?.email || ''} readOnly className={`${inputClass} text-zinc-500`} /></label><label className="text-sm font-bold">Phone number *<input name="phone" required maxLength="24" defaultValue={profile?.phone || ''} placeholder="Include country code" className={inputClass} /></label><label className="text-sm font-bold sm:col-span-2">Country *<input name="country" required maxLength="60" defaultValue={profile?.country || 'India'} className={inputClass} /></label></div>
      <div className="mt-7"><p className="text-sm font-bold">What will you sell? *</p><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{categories.map((category) => <button key={category} type="button" onClick={() => setSelected((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])} className={`rounded-2xl border px-4 py-4 text-sm font-bold transition ${selected.includes(category) ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 hover:border-zinc-400'}`}>{category}</button>)}</div></div>
      <label className="mt-7 block text-sm font-bold">Selling experience<textarea name="experience" rows="4" defaultValue={profile?.experience || ''} placeholder="Tell us what you sell and how you source it." className={`${inputClass} h-auto py-4`} /></label>
      <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-zinc-600"><input required type="checkbox" className="mt-1 h-4 w-4 accent-zinc-950" /><span>I confirm that my details are accurate and I accept listing reviews, delayed payouts, dispute decisions and seller rules.</span></label>
      {error && <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</p>}
      <button disabled={saving} className="mt-7 w-full rounded-2xl bg-zinc-950 px-6 py-4 text-sm font-black text-white disabled:opacity-50 sm:w-auto">{saving ? 'Submitting…' : profile ? 'Resubmit application' : 'Submit application'}</button>
    </form></div></main>;
}
