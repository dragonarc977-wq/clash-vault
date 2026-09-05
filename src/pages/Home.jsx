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
          <a
            href="/shop"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold py-4 px-10 rounded-xl text-lg uppercase tracking-wide transition-all shadow-xl shadow-yellow-500/20"
          >
            Browse Accounts 🛒
          </a>
          <a
            href="/faq"
            className="border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 font-bold py-4 px-10 rounded-xl text-lg uppercase tracking-wide transition-all"
          >
            How It Works
          </a>
        </div>
        <div className="mt-14 flex flex-wrap justify-center gap-12">
          <div>
            <div className="text-5xl font-black text-yellow-400">500+</div>
            <div className="text-sm text-zinc-500 mt-1">Accounts Sold</div>
          </div>
          <div>
            <div className="text-5xl font-black text-yellow-400">24/7</div>
            <div className="text-sm text-zinc-500 mt-1">Support</div>
          </div>
          <div>
            <div className="text-5xl font-black text-yellow-400">100%</div>
            <div className="text-sm text-zinc-500 mt-1">Secure</div>
          </div>
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

      {/* ========== TRUST SECTION ========== */}
      <section className="bg-zinc-950 py-20 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Players Trust <span className="text-yellow-400">Clash Vault</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              We built Clash Vault for serious Clash of Clans players who want safe, fast, and reliable account delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-yellow-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure Transactions</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                All payments are processed through trusted gateways. Your money is protected until delivery is confirmed.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-yellow-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Delivery</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Most accounts are delivered within minutes after payment. No waiting for days.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-yellow-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Verified Accounts</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Every account is checked for legitimacy, progress, and no ban history before listing.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-yellow-500/40 transition">
              <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Live chat and support ready whenever you need help before or after purchase.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ========== END TRUST SECTION ========== */}

      {/* ========== HOMEPAGE FAQ SECTION ========== */}
      <section className="bg-[#0a0a0f] py-20 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              Frequently Asked <span className="text-yellow-400">Questions</span>
            </h2>
            <p className="text-zinc-400">
              Quick answers to the most common questions.
            </p>
          </div>

          <div className="space-y-4">
            {/* Question 1 */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2">
                How fast will I receive the account?
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Most accounts are delivered within 5–15 minutes after payment. You’ll receive the login details instantly on the website and via email.
              </p>
            </div>

            {/* Question 2 */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2">
                Is it safe to buy accounts here?
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Yes. Every account is verified before listing. We only sell clean accounts with no ban history. Payments are secured through Razorpay.
              </p>
            </div>

            {/* Question 3 */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2">
                What if the account gets banned?
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                We provide a replacement guarantee if the account is banned due to previous owner activity within the warranty period.
              </p>
            </div>

            {/* Question 4 */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2">
                Can I change email & password after buying?
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Yes. We strongly recommend changing both immediately after receiving the account for better security.
              </p>
            </div>
          </div>

          {/* View all button */}
          <div className="text-center mt-10">
            <a
              href="/faq"
              className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold transition"
            >
              View all questions
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>
      {/* ========== END HOMEPAGE FAQ ========== */}
    </div>
  );
}