import { useState } from 'react';
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

const faqs = [
  {
    question: 'How fast will I receive the account?',
    answer: 'Most accounts are delivered within 5–15 minutes after successful payment. In rare cases it can take up to 1 hour. You will receive the login details on the website and by email.',
  },
  {
    question: 'Is it safe to buy accounts from ClashVault?',
    answer: 'Every listing is carefully reviewed before it appears in the marketplace. Payments are processed securely, and our support team is available if you need help with an order.',
  },
  {
    question: 'What happens if the account gets banned?',
    answer: 'Eligible purchases include a warranty period shown on the listing. If an issue is caused by previous owner activity during that period, contact support with your order details so our team can investigate.',
  },
  {
    question: 'Can I change the email and password after purchase?',
    answer: 'Yes. When the listing includes full access, you can update the login details after delivery. We recommend securing the account as soon as you receive it.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Refund eligibility depends on the order and its delivery status. If credentials are incorrect or a listing is not as described, open a support ticket and our team will review it.',
  },
  {
    question: 'How do I contact support?',
    answer: 'Sign in, open your profile menu, and select Ticket. You can start a private conversation, link an order, and view every reply in one place.',
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  return <main className="min-h-screen bg-white pt-16 text-zinc-950">
    <section className="border-b border-zinc-100 bg-[radial-gradient(circle_at_50%_0%,rgba(255,227,108,0.45),rgba(255,255,255,0)_52%)] px-5 pb-9 pt-16 text-center sm:px-8 sm:pb-12 sm:pt-20">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b77e00]">The game marketplace, refined</p>
      <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-[-0.055em] text-zinc-950 sm:text-6xl">Built for the way you play.</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">Accounts, items, top-ups and gaming services—curated in one place.</p>
    </section>

    <section className="mx-auto max-w-[1200px] px-5 py-9 sm:px-8 sm:py-12">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold tracking-tight sm:text-xl">Explore games</h2><Link to="/shop" className="text-sm font-bold text-[#b77e00] transition hover:text-[#8e6200]">View all <span aria-hidden="true">→</span></Link></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {games.map(([name, image, short, detail]) => <Link key={name} to={`/game/${image}`} className="group relative h-56 overflow-hidden rounded-2xl bg-zinc-900 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-300 sm:h-64"><img src={`/games/${image}.png`} alt="" className={`absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 ${image === 'brawl-stars' ? 'opacity-100 group-hover:opacity-100' : 'opacity-80 group-hover:opacity-95'}`} /><div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" /><span className="absolute left-3 top-3 rounded-full bg-zinc-950/60 px-2.5 py-1 text-[10px] font-black tracking-[0.12em] text-white backdrop-blur">{short}</span><div className="absolute inset-x-0 bottom-0 p-4"><h3 className="text-base font-bold text-white sm:text-lg">{name}</h3><p className="mt-1 text-xs text-white/70">{detail}</p></div></Link>)}
      </div>
    </section>

    <section className="mx-auto max-w-[1200px] px-5 pb-14 pt-2 sm:px-8 sm:pb-20"><div className="grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3"><div className="bg-white p-6"><p className="text-sm font-bold">Reviewed listings</p><p className="mt-2 text-sm leading-6 text-zinc-500">Clear account information before you buy.</p></div><div className="bg-white p-6"><p className="text-sm font-bold">Secure checkout</p><p className="mt-2 text-sm leading-6 text-zinc-500">A smooth, protected buying experience.</p></div><div className="bg-white p-6"><p className="text-sm font-bold">Real support</p><p className="mt-2 text-sm leading-6 text-zinc-500">Helpful people when you need an answer.</p></div></div></section>

    <section className="border-t border-zinc-100 bg-white px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center sm:mb-12">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b77e00]">Help centre</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-zinc-950 sm:text-4xl">Frequently asked questions</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500 sm:text-base">Everything you need to know before placing an order.</p>
        </div>

        <div className="divide-y divide-zinc-200 border-y border-zinc-200">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-5 py-5 text-left transition hover:text-[#b77e00] sm:py-6"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-bold sm:text-base">{faq.question}</span>
                <svg className={`h-5 w-5 shrink-0 text-[#b77e00] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <p className="max-w-2xl pb-5 pr-10 text-sm leading-7 text-zinc-500 sm:pb-6">{faq.answer}</p>
                </div>
              </div>
            </div>;
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-zinc-500">Still have a question?</p>
          <Link to="/support" className="mt-4 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b77e00]">Contact support</Link>
        </div>
      </div>
    </section>
  </main>;
}
