import { Link } from 'react-router-dom';

const games = [
  ['Clash of Clans', 'clash-of-clans', 'Strategy & progression', 'COC', 'from-amber-500/30 via-orange-500/10'],
  ['Brawl Stars', 'brawl-stars', 'Rare brawlers & progress', 'BRAWL', 'from-rose-500/30 via-orange-500/10'],
  ['Valorant', 'valorant', 'Ranks, skins & collections', 'VAL', 'from-red-500/30 via-fuchsia-500/10'],
  ['Clash Royale', 'clash-royale', 'Decks, cards & progression', 'CR', 'from-sky-500/30 via-blue-500/10'],
  ['Fortnite', 'fortnite', 'Rare skins & cosmetics', 'FN', 'from-violet-500/30 via-blue-500/10'],
  ['Pokémon GO', 'pokemon-go', 'High-level collections', 'POGO', 'from-yellow-400/30 via-emerald-500/10'],
  ['Mobile Legends', 'mobile-legends', 'Ranks, heroes & diamonds', 'MLBB', 'from-cyan-500/30 via-blue-500/10'],
  ['Free Fire', 'free-fire', 'Collections & diamonds', 'FF', 'from-orange-500/30 via-red-500/10'],
];

const accountTypes = [
  ['🎮', 'Game accounts', 'Discover premium accounts across the games you play.'],
  ['🏆', 'Ranked progress', 'Start closer to the rank and progression you want.'],
  ['✨', 'Rare collections', 'Explore high-value cosmetics, items, and collections.'],
];

const protections = [
  ['✓', 'Verified listings', 'Listings are reviewed before they enter the marketplace.'],
  ['↗', 'Fast delivery', 'Clear delivery details so you know what to expect.'],
  ['◌', 'Buyer support', 'Get help when you need it, before and after purchase.'],
  ['⌁', 'Clear details', 'Compare account progress, features, and value with ease.'],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07070b] pb-16 pt-28 text-white sm:pt-24">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"><div className="absolute left-[8%] top-16 h-80 w-80 rounded-full bg-yellow-400/[0.055] blur-[130px]" /><div className="absolute right-[5%] top-[30rem] h-96 w-96 rounded-full bg-amber-500/[0.04] blur-[140px]" /></div>

      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-5 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">Explore the marketplace</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Find your next game account.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">Browse premium accounts, ranked progress, and rare collections across the games you play.</p></div>
          <Link to="/shop" className="inline-flex w-fit items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-[#151105] transition hover:bg-yellow-300">Explore all games <span>→</span></Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {games.map(([name, image, detail, short, tone]) => <Link key={name} to="/shop" className="group relative min-h-48 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111116] transition duration-300 hover:-translate-y-1 hover:border-yellow-400/40 hover:shadow-xl hover:shadow-yellow-400/[0.06]"><img src={`/games/${image}.png`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105 group-hover:opacity-70" /><div className={`absolute inset-0 bg-gradient-to-br ${tone} to-transparent opacity-80`} /><div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-[#09090d]/30 to-black/10" /><div className="relative flex min-h-48 flex-col justify-between p-5"><div className="flex items-start justify-between"><span className="rounded-lg border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] font-black tracking-[0.12em] text-white backdrop-blur">{short}</span><span className="grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/25 text-sm text-white opacity-0 backdrop-blur transition group-hover:opacity-100">→</span></div><div><h2 className="text-lg font-black text-white">{name}</h2><p className="mt-1 text-sm text-zinc-300">{detail}</p></div></div></Link>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#101015] p-6 sm:p-9"><div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">Built for every player</p><h2 className="mt-3 max-w-lg text-3xl font-black tracking-tight sm:text-4xl">A premium marketplace for the games that matter to you.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400">Explore accounts for competitive play, rare cosmetics, and the progress you have been looking for—without a cluttered marketplace experience.</p><Link to="/shop" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-yellow-300 transition hover:text-yellow-200">See what is available <span>→</span></Link></div><div className="grid gap-3 sm:grid-cols-3">{accountTypes.map(([icon, title, text]) => <Link key={title} to="/shop" className="group rounded-2xl border border-white/[0.08] bg-black/20 p-5 transition hover:border-yellow-400/40 hover:bg-white/[0.04]"><span className="grid h-11 w-11 place-items-center rounded-xl bg-yellow-400/10 text-xl">{icon}</span><h3 className="mt-6 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p><span className="mt-5 block text-sm font-bold text-yellow-300 transition group-hover:translate-x-1">Explore →</span></Link>)}</div></div></div>
      </section>

      <section className="border-y border-white/[0.06] bg-[#0b0b10] py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">Made for confident buying</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">A smoother path from browsing to playing.</h2><p className="mt-4 text-sm leading-7 text-zinc-400">Everything in ClashVault is designed to help you discover the right account and make a more informed choice.</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{protections.map(([icon, title, text]) => <div key={title} className="rounded-2xl border border-white/[0.08] bg-[#111116] p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-400/10 text-lg font-black text-yellow-300">{icon}</span><h3 className="mt-5 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p></div>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10"><div className="rounded-3xl border border-yellow-400/20 bg-[radial-gradient(circle_at_80%_10%,rgba(250,204,21,0.2),transparent_26%),linear-gradient(120deg,#19150a,#111116_55%,#0b0b10)] px-6 py-14 text-center sm:px-12"><p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-300">The Vault is open</p><h2 className="mx-auto mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">Find the account that changes your game.</h2><p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-300">Search any game from the top bar, or explore the marketplace to find your next account.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/shop" className="rounded-xl bg-yellow-400 px-6 py-3.5 text-sm font-black text-[#151105] transition hover:bg-yellow-300">Explore marketplace</Link><Link to="/faq" className="rounded-xl border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/[0.06]">Read buyer guide</Link></div></div></section>
    </main>
  );
}
