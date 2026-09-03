import { useEffect, useState } from 'react'
import supabase from './lib/supabase'
import './App.css'

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // 2. Fetch orders for this user, including the account details
        const { data, error } = await supabase
          .from('orders')
          .select('*, accounts(*)') // Joins the account details
          .eq('buyer_id', user.id)

        if (!error) setOrders(data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>Loading your orders...</div>

  return (
    <div className="marketplace">
      <h1>My Orders</h1>
      <p style={{ marginBottom: '20px' }}>Welcome back, {user?.email}</p>
      
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>No orders yet</h3>
          <p>Go buy an account from the store!</p>
          <a href="/" className="admin-link" style={{ color: '#ff4757', marginTop: '10px' }}>← Back to Store</a>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="account-card" style={{ width: '100%', maxWidth: '600px', margin: '0 auto 20px auto' }}>
            <h2>{order.accounts?.title}</h2>
            <p>Price: ₹{order.accounts?.price}</p>
            <p>Status: <strong style={{ color: order.status === 'delivered' ? '#4CAF50' : '#ffcc00' }}>{order.status}</strong></p>
            
            {order.status === 'delivered' && order.accounts?.account_password && (
              <div style={{ backgroundColor: '#0d1117', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                <p style={{ color: '#8b949e' }}>Your account details:</p>
                <p style={{ color: 'white', fontWeight: 'bold' }}>Account name: {order.accounts?.title}</p> {/* Assuming title is the login for demo purposes */}
                <p style={{ color: 'white', fontWeight: 'bold' }}>Password: {order.accounts?.account_password}</p>
              </div>
            )}
          </div>
        ))
      )}
      
      <button onClick={handleLogout} className="buy-btn" style={{ maxWidth: '200px', margin: '20px auto', display: 'block' }}>
        Logout
      </button>
    </div>
  )
}