import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Admin from './Admin.jsx'
import Login from './Login.jsx'
import MyOrders from './MyOrders.jsx'
import Legal from './Legal.jsx'
import Privacy from './Privacy.jsx'
import CookieBanner from './CookieBanner.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  </StrictMode>,
)