import { Link } from 'react-router-dom';

export default function PolicyPage({ eyebrow = 'Legal', title, updated = '15 September 2026', summary, children }) {
  return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-24 text-zinc-950 sm:px-8 sm:pt-28">
    <article className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
      <Link to="/" className="text-sm font-bold text-zinc-500 transition hover:text-zinc-950">← Back to marketplace</Link>
      <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#a87300]">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-4xl">{title}</h1>
      <p className="mt-3 text-xs text-zinc-400">Effective and last updated: {updated}</p>
      {summary && <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold leading-7 text-amber-950">{summary}</div>}
      <div className="mt-9 space-y-8 text-sm leading-7 text-zinc-600">{children}</div>
    </article>
  </main>;
}

export function Section({ title, children }) {
  return <section><h2 className="text-xl font-black tracking-tight text-zinc-950">{title}</h2><div className="mt-3 space-y-3">{children}</div></section>;
}
