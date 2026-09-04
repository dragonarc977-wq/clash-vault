import { useEffect, useState } from 'react'
import supabase from './lib/supabase'
import './App.css'

function App() {
  const [accounts, setAccounts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

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

  // Search Filter Logic (Safe against null values)
  const filteredAccounts = accounts.filter(account => 
    (account.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.town_hall_level || '').toString().includes(searchTerm)
  )

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">⚔️ CLASH VAULT</div>
        <div className="navbar-links">
          <a href="/">Home</a>
          <a href="#accounts">Accounts</a>
          <a href="https://wa.me/917717618181" target="_blank" rel="noopener noreferrer">Support</a>
          <a href="/login">Login</a>
        </div>
      </nav>

      {/* Header Top with Search */}
      <div className="header-top">
        <div style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Categories: TH17 | TH16 | TH15</div>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search for TH17, TH16, etc..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button>🔍</button>
        </div>
        <a href="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 'bold' }}>Login</a>
      </div>

      {/* Hero Section */}
      <header className="hero">
        <h1>Own The Ultimate Base</h1>
        <p>Hand-levelled, war-ready villages. Premium accounts delivered instantly.</p>
      </header>

      {/* Trust & Safety Section */}
      <section className="trust-section">
        <h2 className="trust-title">Why Choose Clash Vault?</h2>
        <p className="trust-subtitle">Your safety is our #1 priority. Here is how we protect you.</p>
        
        <div className="trust-grid">
          <div className="trust-card">
            <div className="trust-icon-box"><svg viewBox="0 0 24 24"><path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 0 1 6 0v3H9z"/></svg></div>
            <h3>Secure Login</h3>
            <p>Access orders with verified Google account. No passwords stored.</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon-box"><svg viewBox="0 0 24 24"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg></div>
            <h3>Instant Delivery</h3>
            <p>Account details appear in "My Orders" the moment payment is confirmed.</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon-box"><svg viewBox="0 0 24 24"><path d="M12 2L2 5v6c0 5.55 4.78 10.29 10 12 5.22-1.71 10-6.45 10-12V5L12 2z"/></svg></div>
            <h3>Buyer Protection</h3>
            <p>Every purchase backed by 24/7 support via WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="how-title">How It Works</h2>
        <div className="how-grid">
          <div className="how-step"><h3>1. Browse</h3><p>Look through our available accounts. Use the search bar to find your perfect Townhall level.</p></div>
          <div className="how-step"><h3>2. Login & Pay</h3><p>Login with Google and pay securely using Razorpay (UPI, Cards, Netbanking).</p></div>
          <div className="how-step"><h3>3. Get Credentials</h3><p>Your login details appear instantly on your "My Orders" dashboard.</p></div>
        </div>
      </section>

      {/* Marketplace */}
      <main className="marketplace" id="accounts">
        <h2>Available Accounts</h2>
        <div className="grid">
          {filteredAccounts.map((account) => (
            <div key={account.id} className="premium-card">
              <div className="premium-badges">
                <span className="badge-platform">{account.platform || 'iOS'}</span>
                <span className="badge-time">⏱ {account.delivery_time || 'Instant'}</span>
              </div>
              
              <div className="premium-img-box">
                <img src={account.image_url || 'https://via.placeholder.com/300'} alt={account.title} className="premium-img" />
              </div>

              <div className="premium-content">
                <h2>{account.title}</h2>
                <p className="stock-text">Stock: {account.stock || 1}</p>
                <div className="premium-bottom">
                  <p className="price">₹{account.price}</p>
                  <button className="buy-btn-circle" onClick={() => handleBuyNow(account)}>🛒</button>
                </div>
              </div>
            </div>
          ))}
          {filteredAccounts.length === 0 && <p style={{ color: 'var(--muted)' }}>No accounts found. Please check back later!</p>}
        </div>
      </main>

      {/* Professional Footer */}
      <footer className="footer">
        <div className="footer-links">
          <div className="footer-column">
            <h4>Clash Vault</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="#accounts">Accounts</a></li>
              <li><a href="/login">Login</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="https://wa.me/917717618181" target="_blank">WhatsApp Us</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <ul>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/admin">Admin Login</a></li>
            </ul>
          </div>
        </div>

        <div className="social-icons">
          <a href="https://wa.me/917717618181" target="_blank">💬</a>
          <a href="#">📘</a>
          <a href="#">📸</a>
          <a href="#">✈️</a>
        </div>

        <p style={{ color: 'var(--muted)' }}>© 2026 Clash Vault. All rights reserved.</p>

        <div className="payment-logos">
          <span>UPI</span> <span>Visa</span> <span>Mastercard</span> <span>Razorpay</span>
        </div>
      </footer>
    </div>
  )
}

export default App