import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';

const WalletIcon = ({ className = 'h-6 w-6' }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M4 6.5h15.5v12H4v-12Zm0 3h15.5M15 14h2" /></svg>;
const ClockIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" strokeWidth="1.7" /><path strokeLinecap="round" strokeWidth="1.7" d="M12 7v5l3 2" /></svg>;

export default function Balance() {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadBuyer = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.user) {
        navigate('/login');
        return;
      }
      setCurrency(session.user.user_metadata?.currency || localStorage.getItem('clashvault_currency') || 'INR');
      setLoading(false);
    };
    loadBuyer();
    return () => { active = false; };
  }, [navigate]);

  const symbol = currency === 'USD' ? '$' : '₹';

  if (loading) return <main className="min-h-screen bg-zinc-50 px-5 pt-28"><div className="mx-auto max-w-6xl animate-pulse"><div className="h-11 w-56 rounded-xl bg-zinc-200" /><div className="mt-8 h-64 rounded-3xl bg-white" /></div></main>;

  return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-28 text-zinc-950 sm:px-8">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b77e00]">Buyer account</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-5xl">My balance</h1>
          <p className="mt-3 text-sm text-zinc-500 sm:text-base">View your ClashVault credit and balance activity.</p>
        </div>
        <Link to="/dashboard" className="inline-flex w-fit rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-bold shadow-sm transition hover:border-zinc-400">Account settings</Link>
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-2">
        <section className="relative overflow-hidden rounded-3xl bg-zinc-950 p-7 text-white shadow-xl sm:min-h-72 sm:p-9">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-300/10 blur-2xl" />
          <div className="relative flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-yellow-300"><WalletIcon /></span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black tracking-wider text-zinc-300">{currency}</span></div>
          <div className="relative mt-12"><p className="text-sm font-semibold text-zinc-400">Available balance</p><p className="mt-2 text-5xl font-black tracking-[-0.05em] sm:text-6xl">{symbol}0.00</p><p className="mt-5 max-w-md text-sm leading-6 text-zinc-400">Account credit can be applied to eligible purchases at checkout.</p></div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm sm:min-h-72 sm:p-9">
          <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-yellow-100 text-[#9a6a00]"><ClockIcon /></span><span className="rounded-full bg-zinc-100 px-3 py-1.5 text-[10px] font-black tracking-wider text-zinc-500">PENDING</span></div>
          <div className="mt-12"><p className="text-sm font-semibold text-zinc-500">Pending balance</p><p className="mt-2 text-5xl font-black tracking-[-0.05em] sm:text-6xl">{symbol}0.00</p><p className="mt-5 max-w-md text-sm leading-6 text-zinc-500">Approved refunds or promotional credit will appear here while being processed.</p></div>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="border-b border-zinc-100 pb-5"><h2 className="text-xl font-black tracking-tight sm:text-2xl">Balance activity</h2><p className="mt-1 text-sm text-zinc-500">Credits and balance payments will appear here.</p></div>
        <div className="py-16 text-center sm:py-20"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-400"><WalletIcon /></span><h3 className="mt-5 text-xl font-black">No balance activity</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">You do not have any credits, refunds, or balance payments yet.</p></div>
      </section>

      <div className="mt-6 flex flex-col justify-between gap-4 rounded-3xl border border-zinc-200 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
        <div><h2 className="text-lg font-black">Questions about your balance?</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Our support team can help with credits and refunds.</p></div>
        <Link to="/support" className="inline-flex w-fit rounded-full border border-zinc-300 px-5 py-3 text-sm font-bold transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white">Contact support</Link>
      </div>
    </div>
  </main>;
}
