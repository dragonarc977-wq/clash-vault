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

  // Display INR currency
  const formatINR = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div>
      {/* Site Header */}
      <header className="site-header">
        <div className="header-inner">
          <a href="/" className="logo">🛡️ Clash Vault</a>
          <nav className="nav-links">
            <a href="#accounts">TH17</a>
            <a href="#accounts">TH16</a>
            <a href="#accounts">TH15</a>
          </nav>
          <div className="search-bar">
            <input type="search" placeholder="Search Townhall level..." />
          </div>
          <a href="/login" className="login-btn">Login with Google</a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?q=80&w=1500&auto=format&fit=crop" alt="CoC Village" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <span className="hero-badge">✨ Premium CoC Marketplace</span>
          <h1>Own a Legend.<span>Buy Maxed Accounts.</span></h1>
          <p>Hand-picked TH17, TH16 and TH15 bases with maxed heroes and rare skins. Secure Google login, instant delivery, and buyer protection on every purchase.</p>
          <div className="hero-buttons">
            <a href="#accounts" className="btn btn-gold">Browse Accounts ➡️</a>
            <a href="#how" className="btn btn-outline">How It Works</a>
          </div>
          <div className="hero-stats">
            <div><strong>500+</strong><p>Accounts Sold</p></div>
            <div><strong>24/7</strong><p>WhatsApp Support</p></div>
            <div><strong>100%</strong><p>Secure Delivery</p></div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="why-choose">
        <h2>Why Choose <span>Clash Vault?</span></h2>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="icon-box">🔒</span>
            <h3>Secure Login</h3>
            <p>Access your orders with a verified Google account. We never store passwords.</p>
          </div>
          <div className="feature-card">
            <span className="icon-box">⚡</span>
            <h3>Instant Delivery</h3>
            <p>Account credentials appear in "My Orders" the moment your payment is confirmed.</p>
          </div>
          <div className="feature-card">
            <span className="icon-box">💬</span>
            <h3>Buyer Protection</h3>
            <p>Every purchase is backed by real 24/7 human support over WhatsApp.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step">
            <span className="step-number">1</span>
            <h3>Browse</h3>
            <p>Look through available accounts and use the search bar to find your perfect Townhall level.</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>Login & Pay</h3>
            <p>Sign in with Google and pay securely using Razorpay — UPI, Cards or Netbanking.</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>Get Credentials</h3>
            <p>Your login details appear instantly on your "My Orders" dashboard.</p>
          </div>
        </div>
      </section>

      {/* Accounts */}
      <section id="accounts" className="accounts-section">
        <div className="section-header">
          <h2>Available Accounts</h2>
          <p>Every base is verified and ready for instant delivery after payment.</p>
        </div>
        <div className="account-grid">
          {accounts.map((account) => (
            <div key={account.id} className="account-card">
              <div className="card-image">
                <span className="townhall-badge">👑 TH{account.town_hall_level}</span>
                <img src={account.image_url || 'https://via.placeholder.com/300'} alt={account.title} />
              </div>
              <div className="card-content">
                <h3>{account.title}</h3>
                <div className="card-stats">
                  <span>🛡️ Max Heroes</span>
                  <span>📈 Lvl {account.town_hall_level}</span>
                </div>
                <div className="card-bottom">
                  <div className="price-block">
                    <p className="price">{formatINR(account.price)}</p>
                  </div>
                  <button className="buy-btn" onClick={() => handleBuyNow(account)}>Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="logo">🛡️ Clash Vault</div>
            <p>The trusted marketplace for premium Clash of Clans accounts. Secure, instant and backed by real human support.</p>
          </div>
          <div className="footer-columns">
            <div className="footer-col">
              <h4>Accounts</h4>
              <a href="#accounts">TH17 Bases</a>
              <a href="#accounts">TH16 Bases</a>
              <a href="#accounts">TH15 Bases</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#how">How It Works</a>
              <a href="#">Reviews</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="https://wa.me/917717618181" target="_blank">WhatsApp Chat</a>
              <a href="/my-orders">My Orders</a>
              <a href="#">Refund Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Clash Vault. Not affiliated with Supercell.</p>
          <p>Payments secured by Razorpay</p>
        </div>
      </footer>
    </div>
  )
}

export default App