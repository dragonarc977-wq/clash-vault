import { useState } from 'react'
import supabase from './lib/supabase'

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [townHall, setTownHall] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [accountEmail, setAccountEmail] = useState('')
  const [accountPassword, setAccountPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (passwordInput === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsLoggedIn(true)
      setError('')
    } else {
      setError('Wrong password! Try again.')
    }
  }

  const addAccount = async (e) => {
    e.preventDefault()
    const { error } = await supabase
      .from('accounts')
      .insert([{ title, town_hall_level: townHall, price, description, account_email: accountEmail, account_password: accountPassword }])

    if (error) alert('Error: ' + error.message)
    else {
      alert('Account added successfully!')
      setTitle(''); setTownHall(''); setPrice(''); setDescription(''); setAccountEmail(''); setAccountPassword('')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="admin-container">
        <h1>Admin Login</h1>
        <form onSubmit={handleLogin}>
          <input type="password" placeholder="Enter Secret Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} required />
          <button type="submit">Login</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <br />
        <a href="/" className="admin-link">← Back to Store</a>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <h1>Add New Account</h1>
      <form onSubmit={addAccount}>
        <input placeholder="Title (e.g. TH17 Max)" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input placeholder="Town Hall Level (e.g. 17)" type="number" value={townHall} onChange={(e) => setTownHall(e.target.value)} required />
        <input placeholder="Price (e.g. 4999)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input placeholder="Account Email (for buyer)" value={accountEmail} onChange={(e) => setAccountEmail(e.target.value)} />
        <input placeholder="Account Password (for buyer)" value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)} />
        <button type="submit">Add Account</button>
      </form>
      <br />
      <a href="/" className="admin-link">← Back to Store</a>
    </div>
  )
}