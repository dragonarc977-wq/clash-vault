import { Link } from 'react-router-dom';

export default function Blog() {
  return <main className="min-h-[70vh] bg-zinc-50 px-5 pb-20 pt-28 text-zinc-950 sm:px-8 sm:pt-32">
    <section className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm sm:p-12">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#a87300]">AllGamersMarket journal</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Blog coming soon.</h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-500">We’ll publish marketplace updates, buyer-safety guides, seller standards and game-industry news here.</p>
      <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center"><p className="font-black">No articles published yet</p><p className="mt-2 text-sm text-zinc-500">New posts will appear on this page when they are ready.</p></div>
      <Link to="/" className="mt-8 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-800">Explore marketplace</Link>
    </section>
  </main>;
}
