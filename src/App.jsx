import { lazy, Suspense, useEffect } from "react";
import { Navigate, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";

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
const Legal = lazy(() => import("./Legal"));
const Privacy = lazy(() => import("./Privacy"));
const CookiePolicy = lazy(() => import("./CookiePolicy"));
const RefundPolicy = lazy(() => import("./RefundPolicy"));
const MarketplaceRules = lazy(() => import("./MarketplaceRules"));
const TransferRisks = lazy(() => import("./TransferRisks"));
const Blog = lazy(() => import("./pages/Blog"));

function PageLoading() {
  return <main className="page-loading grid min-h-screen place-items-center px-5 pt-16" aria-live="polite" aria-busy="true">
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-3">
        <span className="page-loading-mark">AGM</span>
        <div><p className="text-sm font-bold text-zinc-900">Loading marketplace</p><p className="mt-0.5 text-xs text-zinc-500">Preparing the next page…</p></div>
      </div>
      <div className="page-loading-track mt-5"><span /></div>
      <div className="mt-5 grid grid-cols-3 gap-2" aria-hidden="true">
        {[0, 1, 2].map((item) => <span key={item} className="page-loading-card" />)}
      </div>
    </div>
  </main>;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // ✅ Hide navbar on admin pages (SaaS style)
  const hideNavbar = location.pathname.startsWith("/admin");
  const compactAccountPage = [
    "/dashboard",
    "/balance",
    "/my-orders",
    "/notifications",
    "/support",
    "/seller",
    "/seller-chat",
    "/my-products",
    "/become-a-seller",
  ].some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));

  return (
    <div className={`app-wrapper${compactAccountPage ? " account-area" : ""}`}>
      
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
          <Route path="/terms" element={<Legal />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/marketplace-rules" element={<MarketplaceRules />} />
          <Route path="/account-transfer-risks" element={<TransferRisks />} />
          <Route path="/blog" element={<Blog />} />

          <Route path="/admin/support" element={<AdminSupport />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
      {!hideNavbar && <SiteFooter />}
    </div>
  );
}

export default App;
