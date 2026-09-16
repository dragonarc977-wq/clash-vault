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
    answer: 'Most accounts are delivered within 5–15 minutes after successful payment. In rare cases it can take up to 1 hour. You will receive the account credentials provided by the seller.',
  },
  {
    question: 'What is AllGamersMarket and how does it work?',
    answer: 'AllGamersMarket is a marketplace that connects buyers with sellers of gaming accounts. Browse available listings, review the account details, choose the one that suits you, and complete your purchase through the platform. Once your order is confirmed, follow the provided delivery instructions and track everything from My Orders. If you need help at any stage, our support team is available to assist.',
  },
  {
    question: 'What happens if the account gets banned?',
    answer: 'If you experience an issue with the account after delivery, contact our support team as soon as possible and provide your order details. We will review the account details, order information, and available evidence to determine what assistance may be available under our marketplace policies.',
  },
  {
    question: 'Can I change the email and password after purchase?',
    answer: 'After receiving the login details from the seller, we recommend securing the account as soon as possible by updating the available email, password, and security settings. The credentials you can change may vary by account, so always check the account details before purchasing.',
  },
  {
    question: 'How does account delivery work?',
    answer: 'After your payment is confirmed, your order will appear in My Orders, where you can securely access the account details provided with your purchase. Review the credentials and account details after delivery. If anything is missing or doesn’t match what you purchased, open a support ticket and link the order so our team can review it.',
  },
  {
    question: 'How can i contact your customer support?',
    answer: 'Sign in, open your profile menu, and select Ticket. You can start a private conversation, link an order, and view every reply in one place.',
  },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  return <main className="min-h-screen bg-white pt-16 text-zinc-950">
    <section className="border-b border-zinc-200/70 bg-[radial-gradient(circle_at_50%_0%,rgba(161,161,170,0.16),rgba(255,255,255,0)_55%)] px-5 pb-9 pt-14 text-center sm:px-8 sm:pb-12 sm:pt-16">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#b77e00]">The game marketplace, refined</p>
      <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-[-0.045em] text-zinc-950 sm:text-5xl">Built for the way you play.</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">Accounts, items, top-ups and gaming services—curated in one place.</p>
    </section>

    <section id="games" className="mx-auto max-w-300 scroll-mt-20 px-5 py-9 sm:px-8 sm:py-12">
      <div className="mb-5"><h2 className="text-lg font-bold tracking-tight sm:text-xl">Explore games</h2></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {games.map(([name, image, short, detail]) => <Link key={name} to={`/game/${image}`} className="game-tile group relative h-56 overflow-hidden rounded-2xl bg-zinc-900 transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:h-64"><img src={`/games/${image}.png`} alt="" loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105 ${['brawl-stars', 'clash-of-clans'].includes(image) ? 'opacity-100 group-hover:opacity-100' : 'opacity-80 group-hover:opacity-95'}`} /><div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/20 to-transparent" /><span className="absolute left-3 top-3 rounded-full bg-zinc-950/75 px-2.5 py-1 text-[10px] font-black tracking-[0.12em] text-white">{short}</span><div className="absolute inset-x-0 bottom-0 p-4"><h3 className="text-base font-bold text-white sm:text-lg">{name}</h3><p className="mt-1 text-xs text-white/70">{detail}</p></div></Link>)}
      </div>
    </section>

    <section className="mx-auto max-w-300 px-5 pb-14 pt-2 sm:px-8 sm:pb-20"><div className="grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3"><div className="bg-white p-6"><p className="text-sm font-bold">Reviewed listings</p><p className="mt-2 text-sm leading-6 text-zinc-500">Clear account information before you buy.</p></div><div className="bg-white p-6"><p className="text-sm font-bold">Secure checkout</p><p className="mt-2 text-sm leading-6 text-zinc-500">A smooth, protected buying experience.</p></div><div className="bg-white p-6"><p className="text-sm font-bold">Real support</p><p className="mt-2 text-sm leading-6 text-zinc-500">Helpful people when you need an answer.</p></div></div></section>

    <section className="border-t border-zinc-100 bg-white px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center sm:mb-12">
          
          <h2 className="mt-1 text-3xl font-bold tracking-[-0.035em] text-zinc-950 sm:text-3xl">FAQ</h2>
          <p className="mt-3 text-lg font-medium leading-6 text-zinc-950 sm:text-base">Everything you need to know before placing an order.</p>
        </div>

        <div className="divide-y divide-zinc-200 border-y border-zinc-200">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-5 py-5 text-left transition hover:text-[#b74300] sm:py-6"
                aria-expanded={isOpen}
              >
                <span className="text-xl font-medium sm:text-base">{faq.question}</span>
                <svg className={`h-5 w-5 shrink-0 text-[#b74300] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <p className="max-w-2xl pb-5 font-medium pr-10 text-base leading-7 text-zinc-950 sm:pb-6">{faq.answer}</p>
                </div>
              </div>
            </div>;
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-xl font-medium text-zinc-950">Still have a question?</p>
          <Link to="/support" className="mt-4 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b77e00]">Contact support</Link>
        </div>
      </div>
    </section>
  </main>;
}
