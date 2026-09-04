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
      <nav className="navbar">
        <div className="navbar-logo">⚔️ CLASH VAULT</div>
        <div className="navbar-links">
          <a href="/">Home</a>
          <a href="#accounts">Accounts</a>
          <a href="https://wa.me/917717618181" target="_blank" rel="noopener noreferrer">Support</a>
          <a href="/login">Login</a>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-badge">⭐ PREMIUM COC MARKETPLACE</div>
        <h1>Own A Legend.<br/>Buy Maxed Accounts.</h1>
        <p>Hand-picked TH17, TH16 and TH15 bases with maxed heroes and rare skins. Secure Google login, instant delivery, and 24/7 support.</p>
        <div className="hero-stats">
          <div><strong>500+</strong><br/>Accounts Sold</div>
          <div><strong>24/7</strong><br/>Support</div>
          <div><strong>100%</strong><br/>Secure Payments</div>
        </div>
      </header>

      <section className="trust-section">
        <h2 className="trust-title">Why Choose Clash Vault?</h2>
        <div className="trust-grid">
          <div className="trust-card">
            <div className="trust-icon-box">🔒</div>
            <h3>Secure Google Login</h3>
            <p>Access your orders with verified Google account.</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon-box">⚡</div>
            <h3>Instant Delivery</h3>
            <p>Account details appear in "My Orders" instantly.</p>
          </div>
          <div className="trust-card">
            <div className="trust-icon-box">🛡️</div>
            <h3>Buyer Protection</h3>
            <p>Every purchase backed by 24/7 support via WhatsApp.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2 className="how-title">How It Works</h2>
        <div className="how-grid">
          <div className="how-step"><h3>1. Browse</h3><p>Find your perfect Townhall level.</p></div>
          <div className="how-step"><h3>2. Login & Pay</h3><p>Pay securely using Razorpay.</p></div>
          <div className="how-step"><h3>3. Get Credentials</h3><p>Details appear in "My Orders".</p></div>
        </div>
      </section>

      <main className="marketplace" id="accounts">
        <h2>Available Accounts</h2>
        <div className="grid">
          {accounts.map((account) => (
            <div key={account.id} className="v0-card">
              <img src={account.image_url || 'https://via.placeholder.com/300'} alt={account.title} className="v0-card-image" />
              <div className="v0-card-content">
                <h3>{account.title}</h3>
                <p>TH: {account.town_hall_level}</p>
                <div className="v0-card-bottom">
                  <p className="price">₹{account.price}</p>
                  <button className="buy-btn-circle" onClick={() => handleBuyNow(account)}>🛒</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 Clash Vault. All rights reserved.</p>
        <a href="/terms">Terms</a> | <a href="/privacy">Privacy</a>
        <br />
        <a href="/admin">Admin Login</a>
      </footer>
    </div>
  )
}

export default App