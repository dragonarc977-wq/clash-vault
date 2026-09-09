import { Link } from 'react-router-dom';

const games = [
  ['Clash of Clans', 'clash-of-clans', 'COC', 'Accounts & gems'],
  ['Brawl Stars', 'brawl-stars', 'BRAWL', 'Accounts & coins'],
  ['Valorant', 'valorant', 'VAL', 'Ranks & skins'],
  ['Clash Royale', 'clash-royale', 'CR', 'Cards & chests'],
  ['Fortnite', 'fortnite', 'FN', 'Skins & V-Bucks'],
  ['Pokémon GO', 'pokemon-go', 'POGO', 'Accounts & items'],
  ['Mobile Legends', 'mobile-legends', 'MLBB', 'Ranks & diamonds'],
  ['Free Fire', 'free-fire', 'FF', 'Accounts & diamonds'],
];

export default function Home() {
  return <main className="min-h-screen bg-white pt-16 text-zinc-950">
    <section className="border-b border-zinc-100 bg-[radial-gradient(circle_at_50%_0%,rgba(255,227,108,0.45),rgba(255,255,255,0)_52%)] px-5 pb-9 pt-16 text-center sm:px-8 sm:pb-12 sm:pt-20">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b77e00]">The game marketplace, refined</p>
      <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-[-0.055em] text-zinc-950 sm:text-6xl">Built for the way you play.</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">Accounts, items, top-ups and gaming services—curated in one place.</p>
    </section>

    <section className="mx-auto max-w-[1200px] px-5 py-9 sm:px-8 sm:py-12">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold tracking-tight sm:text-xl">Explore games</h2><Link to="/shop" className="text-sm font-bold text-[#b77e00] transition hover:text-[#8e6200]">View all <span aria-hidden="true">→</span></Link></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 lg:gap-4">
        {games.map(([name, image, short, detail]) => <Link key={name} to="/shop" className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-300"><img src={`/games/${image}.png`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-95" /><div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" /><span className="absolute left-3 top-3 rounded-full bg-zinc-950/60 px-2.5 py-1 text-[10px] font-black tracking-[0.12em] text-white backdrop-blur">{short}</span><div className="absolute inset-x-0 bottom-0 p-4"><h3 className="text-base font-bold text-white sm:text-lg">{name}</h3><p className="mt-1 text-xs text-white/70">{detail}</p></div></Link>)}
      </div>
    </section>

    <section className="mx-auto max-w-[1200px] px-5 pb-14 pt-2 sm:px-8 sm:pb-20"><div className="grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3"><div className="bg-white p-6"><p className="text-sm font-bold">Reviewed listings</p><p className="mt-2 text-sm leading-6 text-zinc-500">Clear account information before you buy.</p></div><div className="bg-white p-6"><p className="text-sm font-bold">Secure checkout</p><p className="mt-2 text-sm leading-6 text-zinc-500">A smooth, protected buying experience.</p></div><div className="bg-white p-6"><p className="text-sm font-bold">Real support</p><p className="mt-2 text-sm leading-6 text-zinc-500">Helpful people when you need an answer.</p></div></div></section>
  </main>;
}
