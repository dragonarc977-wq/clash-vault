import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import marketplaceHero from '../assets/marketplace-vault-hero.png';

const games = [
  ['Clash of Clans', 'clash-of-clans', 'COC'],
  ['Brawl Stars', 'brawl-stars', 'BRAWL'],
  ['Valorant', 'valorant', 'VAL'],
  ['Clash Royale', 'clash-royale', 'CR'],
  ['Fortnite', 'fortnite', 'FN'],
  ['Pokémon GO', 'pokemon-go', 'POGO'],
  ['Mobile Legends', 'mobile-legends', 'MLBB'],
  ['Free Fire', 'free-fire', 'FF'],
];

const assurances = [
  ['Reviewed listings', 'Clear listing information before you buy.'],
  ['Secure checkout', 'A smooth, protected checkout experience.'],
  ['Real support', 'Helpful people when a question needs an answer.'],
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const submit = (event) => { event.preventDefault(); navigate('/shop'); };

  return <main className="min-h-screen overflow-hidden bg-[#08090d] pb-16 pt-[76px] text-white">
    <section className="relative isolate border-b border-white/[0.07]">
      <img src={marketplaceHero} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-75" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,9,13,0.88),rgba(8,9,13,0.25),rgba(8,9,13,0.74)),linear-gradient(0deg,#08090d_0%,transparent_48%,rgba(8,9,13,0.28)_100%)]" />
      <div className="mx-auto flex min-h-[440px] max-w-[1600px] flex-col items-center justify-end px-5 pb-28 pt-20 text-center sm:min-h-[500px] sm:px-8 sm:pb-32 lg:px-10"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-200/90">The game marketplace, refined</p><h1 className="mt-4 text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">Built for the way you play.</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">Accounts, items, top-ups and gaming services—curated in one place.</p></div></div>
      <form onSubmit={submit} className="absolute bottom-0 left-1/2 z-10 w-[calc(100%-2rem)] max-w-5xl translate-x-[-50%] translate-y-1/2 rounded-2xl border border-white/[0.14] bg-[#11131a]/95 p-2 shadow-2xl shadow-black/70 backdrop-blur-xl"><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-3 px-3"><svg className="h-5 w-5 shrink-0 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-4.35-4.35M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" /></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search games, accounts, items, top-ups..." className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-zinc-500" /></div><div className="flex items-center gap-2"><span className="hidden rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3 text-xs font-semibold text-zinc-400 md:block">All marketplace</span><button className="rounded-xl bg-yellow-300 px-6 py-3.5 text-sm font-black text-[#171206] transition duration-200 hover:bg-yellow-200 active:scale-[0.98]">Search</button></div></div></form>
    </section>

    <section className="mx-auto max-w-[1280px] px-5 pb-8 pt-24 sm:px-8 sm:pt-28 lg:px-10"><div className="mb-6 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Explore games</p><Link to="/shop" className="text-sm font-bold text-yellow-200 transition hover:text-yellow-100">View all <span aria-hidden="true">→</span></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 lg:gap-4">{games.map(([name, image, short]) => <Link key={name} to="/shop" className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#11131a] transition duration-300 hover:-translate-y-1 hover:border-yellow-300/45 hover:shadow-2xl hover:shadow-black/50"><img src={`/games/${image}.png`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-90" /><div className="absolute inset-0 bg-gradient-to-t from-[#08090d] via-[#08090d]/20 to-black/10" /><span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] font-black tracking-[0.12em] text-white backdrop-blur">{short}</span><div className="absolute inset-x-0 bottom-0 p-4"><h2 className="text-base font-bold text-white sm:text-lg">{name}</h2><span className="mt-2 inline-flex text-xs font-bold text-yellow-200 opacity-0 transition duration-200 group-hover:opacity-100">Explore →</span></div></Link>)}</div></section>

    <section className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 sm:py-24 lg:px-10"><div className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0d0f15] px-6 py-12 sm:px-12 sm:py-16"><div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-300/[0.08] blur-3xl" /><div className="absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent" /><div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.24em] text-yellow-200">A better place to buy</p><h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.035em] text-white sm:text-5xl">Everything you need to level up, without the noise.</h2><Link to="/shop" className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/[0.13] bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:border-yellow-300/45 hover:bg-yellow-300 hover:text-[#171206]">Explore the marketplace <span aria-hidden="true">→</span></Link></div><div className="grid gap-3">{assurances.map(([title, text], index) => <div key={title} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-black/20 p-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-yellow-300/20 text-xs font-bold text-yellow-200">0{index + 1}</span><div><h3 className="text-sm font-bold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-zinc-400">{text}</p></div></div>)}</div></div></div></section>
  </main>;
}
