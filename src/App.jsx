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
        <a href="/admin">Admin Login</a>
      </footer>
    </div>
  )
}

export default App