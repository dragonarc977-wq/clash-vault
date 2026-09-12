import { Navigate, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AccountDetail from "./pages/AccountDetail";
import Checkout from "./pages/Checkout";
import Login from "./Login";
import MyOrders from "./MyOrders";
import Admin from "./Admin";
import FAQ from "./pages/FAQ";
import Support from "./pages/Support";
import AdminSupport from "./pages/AdminSupport"; // ✅ FIXED
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Balance from "./pages/Balance";
import SellerOnboarding from "./pages/SellerOnboarding";
import SellerDashboard from "./pages/SellerDashboard";
import MyProducts from "./pages/MyProducts";
import SellerMessages from "./pages/SellerMessages";
import GamePage from "./pages/GamePage";

function App() {
  const location = useLocation();

  // ✅ Hide navbar on admin pages (SaaS style)
  const hideNavbar = location.pathname.startsWith("/admin");

  return (
    <div className="app-wrapper">
      
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Navigate to="/" replace />} />
        <Route path="/account/:id" element={<AccountDetail />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/support" element={<Support />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/balance" element={<Balance />} />
        <Route path="/become-a-seller" element={<SellerOnboarding />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/my-products" element={<MyProducts />} />
        <Route path="/seller-chat" element={<SellerMessages />} />
        <Route path="/seller-chat/:listingId" element={<SellerMessages />} />
        <Route path="/game/:gameId" element={<GamePage />} />

        {/* ✅ ADMIN SUPPORT */}
        <Route path="/admin/support" element={<AdminSupport />} />

        {/* ✅ Catch-all */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
