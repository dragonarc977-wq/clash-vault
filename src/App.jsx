import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import AccountDetail from './pages/AccountDetail';
import Checkout from './pages/Checkout';
import Login from './Login';
import MyOrders from './MyOrders';
import Admin from './Admin';
import FAQ from './pages/FAQ';          // ← added

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/account/:id" element={<AccountDetail />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/faq" element={<FAQ />} />   {/* ← added */}
        
        {/* Catch-all: redirect unknown paths to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;