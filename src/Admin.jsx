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
          <a href="https://wa.me/917717618181" target="_blank">Support</a>
          <a href="/login">Login</a>
        </div>
      </nav>

      <header className="hero">
        <h1>Own The Ultimate Base</h1>
        <p>Hand-levelled, war-ready villages. Premium accounts delivered instantly.</p>
      </header>

      <section className="trust-section">
        <h2 className="trust-title">Why Choose Clash Vault?</h2>
        <div className="trust-grid">
          <div className="trust-card"><h3>🔒 Secure Login</h3><p>Access orders with verified Google account.</p></div>
          <div className="trust-card"><h3>⚡ Instant Delivery</h3><p>Credentials appear in "My Orders" instantly.</p></div>
          <div className="trust-card"><h3>🛡️ Buyer Protection</h3><p>24/7 support via WhatsApp.</p></div>
        </div>
      </section>

      <main className="marketplace" id="accounts">
        <h2>Available Accounts</h2>
        <div className="grid">
          {accounts.map((account) => (
            <div key={account.id} className="account-card">
              <div className="card-image" style={{ backgroundImage: `url(${account.image_url || 'https://via.placeholder.com/300'})` }}></div>
              <div className="card-content">
                <div className="card-badge"><span>{account.platform || 'iOS'}</span><span>⏱ {account.delivery_time || 'Instant'}</span></div>
                <h2>{account.title}</h2>
                <div className="card-bottom">
                  <p className="card-price">₹{account.price}</p>
                  <button className="buy-btn" onClick={() => handleBuyNow(account)}>🛒</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-links">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/admin">Admin</a>
        </div>
        <p>© 2026 Clash Vault. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App