import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import AccountCard from '../components/AccountCard';

const games = [
  ['Clash of Clans', '🏰', 'TH15–TH17 accounts', 'COC', 'from-amber-500/30 via-orange-500/10'],
  ['Brawl Stars', '⭐', 'Rare & maxed brawlers', 'BRAWL', 'from-rose-500/30 via-orange-500/10'],
  ['Valorant', '🎯', 'Skins & ranked accounts', 'VAL', 'from-red-500/30 via-fuchsia-500/10'],
  ['Clash Royale', '👑', 'Maxed decks & cards', 'CR', 'from-sky-500/30 via-blue-500/10'],
  ['Fortnite', '🪂', 'Rare skins & cosmetics', 'FN', 'from-violet-500/30 via-blue-500/10'],
  ['Pokémon GO', '⚡', 'High-level collections', 'POGO', 'from-yellow-400/30 via-emerald-500/10'],
];

const protections = [
  ['✓', 'Verified listings', 'Every listing is screened before it enters the Vault.'],
  ['↗', 'Fast delivery', 'Get your account details quickly after payment.'],
  ['◌', 'Buyer support', 'Real people are available when you need help.'],
];

const steps = [
  ['01', 'Choose your game', 'Explore verified accounts across the games you play.'],
  ['02', 'Find your perfect account', 'Compare progress, cosmetics, price, and delivery details.'],
  ['03', 'Secure your new account', 'Complete checkout and receive your account information.'],
];

export default function Home() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data } = await supabase
        .from('accounts')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(6);
      setAccounts(data || []);
      setLoading(false);
    };
    fetchAccounts();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#07070b] pt-[70px] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_17%_25%,rgba(234,179,8,0.2),transparent_28%),radial-gradient(circle_at_83%_8%,rgba(249,115,22,0.12),transparent_24%),linear-gradient(180deg,#10100d_0%,#07070b_88%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[-22rem] -z-10 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full border border-yellow-400/10 bg-yellow-400/[0.035]" />

        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-24">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-400/[0.08] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-yellow-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />The premium gaming marketplace</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-8xl">Your next<span className="block bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">legendary account.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">Discover high-value game accounts from a marketplace designed for players who expect a better way to buy.</p>
            <form onSubmit={(event) => { event.preventDefault(); navigate('/shop'); }} className="mt-9 max-w-2xl rounded-2xl border border-white/10 bg-[#111116]/90 p-2 shadow-2xl shadow-black/40 backdrop-blur"><div className="flex flex-col gap-2 sm:flex-row"><div className="flex min-w-0 flex-1 items-center gap-3 px-3"><svg className="h-5 w-5 shrink-0 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-600" placeholder="Search a game, account type, or rank…" /></div><button className="rounded-xl bg-yellow-400 px-6 py-3.5 text-sm font-black text-[#151105] transition hover:bg-yellow-300">Explore marketplace</button></div></form>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-zinc-500"><span>✓ Verified listings</span><span>✓ Fast delivery</span><span>✓ Dedicated support</span></div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none"><div className="absolute -inset-5 rounded-[2rem] bg-yellow-400/[0.08] blur-3xl" /><div className="relative overflow-hidden rounded-[1.75rem] border border-yellow-300/20 bg-[#111116] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.55)] sm:p-6"><div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-yellow-400/20 via-amber-500/10 to-transparent" /><div className="relative flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400 text-lg text-black">✦</div><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-yellow-300">Featured vault drop</p><p className="mt-1 text-sm text-zinc-400">Fresh accounts, ready to play</p></div></div><span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">Live stock</span></div><div className="relative mt-7 rounded-2xl border border-white/10 bg-[#0a0a0e] p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Clash of Clans</p><h2 className="mt-2 text-3xl font-black tracking-tight">TH17 MAXED</h2><p className="mt-1 text-sm text-zinc-400">Heroes maxed · Full access · Ready now</p></div><span className="text-5xl">🏰</span></div><div className="mt-5 grid grid-cols-3 gap-2">{[['Town Hall', '17', 'text-yellow-300'], ['Gems', '5K+', 'text-yellow-300'], ['Delivery', 'Fast', 'text-emerald-300']].map(([label, value, color]) => <div key={label} className="rounded-xl bg-white/[0.045] p-3"><p className="text-[10px] font-bold uppercase text-zinc-500">{label}</p><p className={`mt-1 text-lg font-black ${color}`}>{value}</p></div>)}</div><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4"><span className="text-sm text-zinc-500">Verified marketplace listing</span><span className="text-xl font-black text-yellow-300">Premium</span></div></div><div className="relative mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/[0.07] bg-white/[0.025] py-3 text-center">{[['Secure', 'Checkout'], ['Fast', 'Delivery'], ['24/7', 'Support']].map(([value, label]) => <div key={label}><p className="text-lg font-black text-white">{value}</p><p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p></div>)}</div></div></div>
        </div>
      </section>

      <section className="border-b border-white/5 bg-[#0a0a0e] py-7"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-5 px-5 text-center sm:grid-cols-4 sm:px-8 lg:px-10">{[['Premium', 'Player-first marketplace'], ['Protected', 'Purchase journey'], ['Fast', 'Account delivery'], ['Human', 'Buyer support']].map(([title, copy]) => <div key={title}><p className="text-xl font-black text-white">{title}</p><p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">{copy}</p></div>)}</div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">Browse by game</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Your game. Your advantage.</h2></div><Link to="/shop" className="group inline-flex items-center gap-2 text-sm font-bold text-yellow-300 transition hover:text-yellow-200">View all games <span className="transition group-hover:translate-x-1">→</span></Link></div><div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{games.map(([name, icon, detail, short, tone]) => <Link key={name} to="/shop" className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111116] p-5 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/40 hover:shadow-xl hover:shadow-yellow-400/[0.06]"><div className={`absolute inset-0 bg-gradient-to-br ${tone} to-transparent opacity-70 transition-opacity group-hover:opacity-100`} /><div className="relative flex items-center gap-4"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/20 text-3xl">{icon}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h3 className="font-black text-white">{name}</h3><span className="text-xs font-black tracking-wider text-yellow-300">{short}</span></div><p className="mt-1 text-sm text-zinc-400">{detail}</p></div><span className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-yellow-300">→</span></div></Link>)}</div></section>

      <section className="border-y border-white/5 bg-[#0b0b10] py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">Fresh from the vault</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Featured accounts</h2><p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400">A selection of recently added accounts ready for their next owner.</p></div><Link to="/shop" className="inline-flex rounded-xl border border-yellow-400/30 px-4 py-2.5 text-sm font-bold text-yellow-300 transition hover:bg-yellow-400 hover:text-[#151105]">Browse all listings</Link></div><div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{loading ? [1, 2, 3].map((item) => <div key={item} className="h-[380px] animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.035]" />) : accounts.length ? accounts.slice(0, 3).map((account) => <AccountCard key={account.id} account={account} />) : <div className="col-span-full rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center"><p className="text-3xl">✦</p><h3 className="mt-4 text-xl font-black">New accounts are landing soon</h3><p className="mt-2 text-sm text-zinc-500">Browse the shop to explore the available collection.</p><Link to="/shop" className="mt-6 inline-flex rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-[#151105]">Explore the shop</Link></div>}</div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10"><div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">Built around confidence</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">A better marketplace experience from checkout to handover.</h2><p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">ClashVault focuses on the details that matter: clear listing information, fast help, and a smoother journey into your next game account.</p><Link to="/faq" className="mt-7 inline-flex items-center gap-2 font-bold text-yellow-300 transition hover:text-yellow-200">Learn how buying works <span>→</span></Link></div><div className="grid gap-4 sm:grid-cols-3">{protections.map(([icon, title, text]) => <div key={title} className="rounded-2xl border border-white/[0.08] bg-[#111116] p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400/10 text-lg font-black text-yellow-300">{icon}</span><h3 className="mt-5 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p></div>)}</div></div></section>

      <section className="border-t border-white/5 bg-[#0b0b10] py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="text-center"><p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">Simple by design</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">From browsing to playing in three steps.</h2></div><div className="mt-12 grid gap-4 md:grid-cols-3">{steps.map(([number, title, text]) => <div key={number} className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111116] p-6"><span className="text-6xl font-black tracking-tighter text-yellow-400/[0.11]">{number}</span><div className="relative -mt-4"><h3 className="text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p></div></div>)}</div></div></section>

      <section className="px-5 py-20 sm:px-8 lg:px-10"><div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-yellow-400/20 bg-[radial-gradient(circle_at_80%_10%,rgba(250,204,21,0.22),transparent_27%),linear-gradient(120deg,#19150a,#111116_55%,#0b0b10)] px-6 py-14 text-center sm:px-12"><p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">The vault is open</p><h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">Find the account that changes your game.</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-300">Explore the marketplace and discover a better way to buy your next game account.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/shop" className="rounded-xl bg-yellow-400 px-6 py-3.5 text-sm font-black text-[#151105] transition hover:bg-yellow-300">Explore marketplace</Link><Link to="/faq" className="rounded-xl border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.06]">Read buyer guide</Link></div></div></section>
    </main>
  );
}
