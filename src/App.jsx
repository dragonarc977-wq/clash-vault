import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import AccountDetail from './pages/AccountDetail';
import Admin from './Admin';
import Login from './Login';
import MyOrders from './MyOrders';

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/account/:id" element={<AccountDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;