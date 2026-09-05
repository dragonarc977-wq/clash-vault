import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import AccountCard from '../components/AccountCard';

export default function Home() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data } = await supabase.from('accounts').select('*').limit(6);
      setAccounts(data || []);
    };
    fetchAccounts();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans pt-20">
      {/* Hero Section */}
      <section className="text-center px-6 py-20 bg-gradient-to-b from-yellow-500/10 to-transparent">
        <span className="inline-block border border-yellow-500/40 text-yellow-400 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
          ⚡ Premium CoC Marketplace
        </span>
        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
          OWN A LEGEND.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
            BUY MAXED ACCOUNTS.
          </span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8">
          Hand-picked TH17, TH16 and TH15 bases with maxed heroes. Instant delivery, 24/7 support, and buyer protection on every purchase.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/shop" className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold py-4 px-10 rounded-xl text-lg uppercase tracking-wide transition-all shadow-xl shadow-yellow-500/20">
            Browse Accounts 🛒
          </a>
          <a href="/faq" className="border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 font-bold py-4 px-10 rounded-xl text-lg uppercase tracking-wide transition-all">
            How It Works
          </a>
        </div>
        <div className="mt-14 flex flex-wrap justify-center gap-12">
          <div><div className="text-5xl font-black text-yellow-400">500+</div><div className="text-sm text-zinc-500 mt-1">Accounts Sold</div></div>
          <div><div className="text-5xl font-black text-yellow-400">24/7</div><div className="text-sm text-zinc-500 mt-1">Support</div></div>
          <div><div className="text-5xl font-black text-yellow-400">100%</div><div className="text-sm text-zinc-500 mt-1">Secure</div></div>
        </div>
      </section>

      {/* Featured Accounts */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        <h2 className="text-3xl md:text-4xl font-black mb-10">Featured Accounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </main>
    </div>
  );
}