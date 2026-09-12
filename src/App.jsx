import { lazy, Suspense } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

const Home = lazy(() => import("./pages/Home"));
const AccountDetail = lazy(() => import("./pages/AccountDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./Login"));
const MyOrders = lazy(() => import("./MyOrders"));
const Admin = lazy(() => import("./Admin"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Support = lazy(() => import("./pages/Support"));
const AdminSupport = lazy(() => import("./pages/AdminSupport"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Balance = lazy(() => import("./pages/Balance"));
const SellerOnboarding = lazy(() => import("./pages/SellerOnboarding"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const MyProducts = lazy(() => import("./pages/MyProducts"));
const SellerMessages = lazy(() => import("./pages/SellerMessages"));
const SellerProfile = lazy(() => import("./pages/SellerProfile"));
const GamePage = lazy(() => import("./pages/GamePage"));

function PageLoading() {
  return <main className="grid min-h-screen place-items-center px-5 pt-16"><div className="flex items-center gap-3 text-xs font-bold text-zinc-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />Loading</div></main>;
}

function App() {
  const location = useLocation();

  // ✅ Hide navbar on admin pages (SaaS style)
  const hideNavbar = location.pathname.startsWith("/admin");

  return (
    <div className="app-wrapper">
      
      {!hideNavbar && <Navbar />}

      <Suspense fallback={<PageLoading />}>
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
          <Route path="/seller/:sellerId" element={<SellerProfile />} />
          <Route path="/my-products" element={<MyProducts />} />
          <Route path="/seller-chat" element={<SellerMessages />} />
          <Route path="/seller-chat/:listingId" element={<SellerMessages />} />
          <Route path="/game/:gameId" element={<GamePage />} />

          <Route path="/admin/support" element={<AdminSupport />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
