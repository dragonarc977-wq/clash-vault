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
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '7717618181'
        },
        theme: { color: '#ffd700' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    }
    document.body.appendChild(script)
  }

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
            <div className="trust-icon-box">
              <svg viewBox="0 0 24 24"><path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 0 1 6 0v3H9z"/></svg>
            </div>
            <h3>Secure Google Login</h3>
            <p>Access your orders with a verified Google account. No passwords stored on our servers.</p>
          </div>

          <div className="trust-card">
            <div className="trust-icon-box">
              <svg viewBox="0 0 24 24"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>
            </div>
            <h3>Instant Delivery</h3>
            <p>Your account details appear in your "My Orders" page the moment your payment is confirmed.</p>
          </div>

          <div className="trust-card">
            <div className="trust-icon-box">
              <svg viewBox="0 0 24 24"><path d="M12 2L2 5v6c0 5.55 4.78 10.29 10 12 5.22-1.71 10-6.45 10-12V5L12 2z"/></svg>
            </div>
            <h3>Buyer Protection</h3>
            <p>Every purchase is backed by our 24/7 support. Get help instantly via WhatsApp.</p>
          </div>

          <div className="trust-card">
            <div className="trust-icon-box">
              <svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>
            </div>
            <h3>24/7 Support</h3>
            <p>Not sure? Talk to a real human directly on WhatsApp before or after your purchase.</p>
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <main className="marketplace" id="accounts">
        <h2>Available Accounts</h2>
        <div className="grid">
          {accounts.map((account) => (
            <div key={account.id} className="account-card">
              <h2>{account.title}</h2>
              <p>Townhall Level: {account.town_hall_level}</p>
              <p className="price">₹{account.price}</p>
              <button className="buy-btn" onClick={() => handleBuyNow(account)}>Buy Now</button>
            </div>
          ))}
        </div>
      </main>

            {/* Footer */}
      <footer className="footer">
        <p>© 2026 Clash Vault. All rights reserved.</p>
        <div style={{ marginBottom: '10px' }}>
          <a href="/terms" style={{ color: '#ffd700', textDecoration: 'none', marginRight: '15px' }}>Terms of Service</a>
          <a href="/privacy" style={{ color: '#ffd700', textDecoration: 'none' }}>Privacy Policy</a>
        </div>
        <a href="/admin" style={{ color: '#a0b0c0', fontSize: '12px' }}>Admin Login</a>
      </footer>

export default App