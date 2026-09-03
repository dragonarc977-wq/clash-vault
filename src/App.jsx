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
    // 1. Check if user is logged in FIRST
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Please login first to buy an account!');
      window.location.href = '/login';
      return;
    }

    const buyerId = user.id;

    // 2. Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Uses your public Key ID
        amount: account.price * 100, // Convert to paise
        currency: 'INR',
        name: 'Clash Vault',
        description: account.title,
        notes: { account_id: account.id, buyer_id: buyerId }, // <--- UPDATED LINE
        handler: async (response) => {
          alert('Payment Successful! Check My Orders for your login details.');
          setTimeout(() => window.location.href = '/my-orders', 2000)
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '7717618181'
        },
        theme: {
          color: '#ff4757',
        },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    }
    document.body.appendChild(script)
  }

  return (
    <div className="marketplace">
      <h1>Clash Vault Marketplace</h1>
      <div className="grid">
        {accounts.map((account) => (
          <div key={account.id} className="account-card">
            <h2>{account.title}</h2>
            <p>Townhall Level: {account.town_hall_level}</p>
            <p className="price">₹{account.price}</p>
            <button onClick={() => handleBuyNow(account)}>Buy Now</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App