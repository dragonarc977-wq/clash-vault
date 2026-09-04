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
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <style>{`
        .home-hero { text-align: center; padding: 80px 20px; background: var(--bg-secondary); border-bottom: 1px solid var(--gold-border); }
        .home-badge { display: inline-block; border: 1px solid var(--gold-border); color: var(--gold-primary); padding: 5px 15px; border-radius: 20px; font-size: 12px; letter-spacing: 2px; margin-bottom: 20px; }
        .home-title { font-size: 56px; font-weight: 800; margin-bottom: 15px; line-height: 1.1; }
        .home-title span { color: var(--gold-primary); }
        .home-subtitle { color: var(--text-secondary); font-size: 18px; max-width: 600px; margin: 0 auto 40px; line-height: 1.6; }
        .home-cta { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #ffd700, #e6c200); color: #0a0a0f; font-weight: 700; padding: 15px 30px; border-radius: 12px; text-decoration: none; }
        .home-trust { display: flex; justify-content: center; gap: 40px; margin-top: 50px; flex-wrap: wrap; }
        .home-trust div { display: flex; flex-direction: column; }
        .home-trust strong { color: var(--gold-primary); font-size: 30px; }
        .home-trust span { color: var(--text-muted); font-size: 14px; }
        .home-section { max-width: 1200px; margin: 60px auto; padding: 0 24px; }
        .home-section-title { font-size: 32px; font-weight: 800; margin-bottom: 30px; text-align: center; }
        .home-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        @media (max-width: 768px) { .home-title { font-size: 40px; } .home-trust { gap: 20px; } }
      `}</style>

      <div className="home-hero">
        <span className="home-badge">⚡ PREMIUM COC MARKETPLACE</span>
        <h1 className="home-title">Own a Legend.<br /><span>Buy Maxed Accounts.</span></h1>
        <p className="home-subtitle">Hand-picked TH17, TH16 and TH15 bases with maxed heroes. Instant delivery and 24/7 support.</p>
        <a href="/shop" className="home-cta">Browse Accounts 🛒</a>
        
        <div className="home-trust">
          <div><strong>500+</strong><span>Accounts Sold</span></div>
          <div><strong>24/7</strong><span>Support</span></div>
          <div><strong>100%</strong><span>Secure</span></div>
        </div>
      </div>

      <div className="home-section">
        <h2 className="home-section-title">Featured Accounts</h2>
        <div className="home-grid">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>
    </div>
  );
}