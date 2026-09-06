import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import AccountDetail from "./pages/AccountDetail";
import Checkout from "./pages/Checkout";
import Login from "./Login";
import MyOrders from "./MyOrders";
import Admin from "./Admin";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import AdminSupport from "./pages/AdminSupport"; // ✅ FIXED

function App() {
  const location = useLocation();

  // ✅ Hide navbar on admin pages (SaaS style)
  const hideNavbar = location.pathname.startsWith("/admin");

  return (
    <div className="app-wrapper">
      
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/account/:id" element={<AccountDetail />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/support" element={<Support />} />

        {/* ✅ ADMIN SUPPORT */}
        <Route path="/admin/support" element={<AdminSupport />} />

        {/* ✅ Catch-all */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;