import { useEffect, useState } from 'react'
import supabase from './lib/supabase'
import './App.css'

function App() {
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data, error } = await supabase.from('accounts').select('*')
      if (error) console.log('Error fetching data:', error)
      else setAccounts(data)
    }
    fetchAccounts()
  }, [])

  const handleBuyNow = async (account) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Please login first to buy an account!')
      window.location.href = '/login'
      return
    }
    const buyerId = user.id
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: account.price * 100,
        currency: 'INR',
        name: 'Clash Vault',
        description: account.title,
        notes: { account_id: account.id, buyer_id: buyerId },
        handler: async (response) => {
          alert('Payment Successful! Check My Orders for your login details.')
          setTimeout(() => window.location.href = '/my-orders', 2000)
        },
        prefill: { name: 'Customer', email: 'customer@example.com', contact: '7717618181' },
        theme: { color: '#ffd700' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    }
    document.body.appendChild(script)
  }

  return (
    <div>
      {/* Premium Header */}
      <header className="site-header">
        <div className="logo">⚔️ CLASH VAULT</div>
        <nav className="nav-cats">
          <a href="#accounts">TH17</a>
          <a href="#accounts">TH16</a>
          <a href="#accounts">TH15</a>
        </nav>
        <div className="search-box">
          <input type="text" placeholder="Search accounts..." />
          <span>🔍</span>
        </div>
        <a href="/login" className="login-btn">Login</a>
      </header>

      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="badge">⭐ PREMIUM COC MARKETPLACE</span>
          <h1>Own A Legend.<br/><span>Buy Maxed Accounts.</span></h1>
          <p>Hand-picked TH17, TH16 and TH15 bases with maxed heroes. Instant delivery and 24/7 support.</p>
          <div className="hero-stats">
            <div><strong>500+</strong><span>Accounts Sold</span></div>
            <div><strong>24/7</strong><span>Support</span></div>
            <div><strong>100%</strong><span>Secure</span></div>
          </div>
        </div>
      </section>

      {/* Available Accounts */}
      <main className="main-content">
        <h2 className="section-title">Available Accounts</h2>
        <div className="product-grid">
          {accounts.map((account) => (
            <div key={account.id} className="product-card">
              <div className="prod-img" style={{ backgroundImage: `url(${account.image_url || 'https://via.placeholder.com/300x200/1b263b/ffd700?text=No+Image'})` }}>
                <span className="platform-tag">{account.platform || 'iOS'}</span>
                <span className="time-tag">⏱ {account.delivery_time || 'Instant'}</span>
              </div>
              <div className="prod-info">
                <h3>{account.title}</h3>
                <p className="stats">Level: {account.town_hall_level} | Stock: {account.stock || 1}</p>
                <div className="prod-bottom">
                  <p className="price">₹{account.price}</p>
                  <button className="buy-circle" onClick={() => handleBuyNow(account)}>🛒</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="brand-col">
            <div className="logo">⚔️ CLASH VAULT</div>
            <p>The trusted marketplace for premium Clash of Clans accounts.</p>
          </div>
          <div className="link-col">
            <h4>Marketplace</h4>
            <a href="#accounts">TH17</a>
            <a href="#accounts">TH16</a>
            <a href="#accounts">TH15</a>
          </div>
          <div className="link-col">
            <h4>Support</h4>
            <a href="/my-orders">My Orders</a>
            <a href="https://wa.me/917717618181" target="_blank">WhatsApp</a>
          </div>
          <div className="link-col">
            <h4>Legal</h4>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/admin">Admin</a>
          </div>
        </div>
        <div className="footer-bottom">© 2026 Clash Vault. All rights reserved.</div>
      </footer>
    </div>
  )
}

export default App