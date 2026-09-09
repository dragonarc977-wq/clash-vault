import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from './lib/supabase';

const PackageIcon = () => <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7m-8 4v10" /></svg>;
const ArrowIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 18 6-6-6-6" /></svg>;

const statusStyle = {
  delivered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  paid: 'bg-blue-50 text-blue-700 ring-blue-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
};

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
  : 'Date unavailable';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error: ordersError } = await supabase
        .from('orders')
        .select('*, accounts(*)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (!active) return;
      if (ordersError) setError('We could not load your orders. Please try again.');
      else setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
    return () => { active = false; };
  }, [navigate]);

  return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-28 text-zinc-950 sm:px-8">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b77e00]">Buyer account</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.045em] sm:text-5xl">My orders</h1>
          <p className="mt-3 text-sm text-zinc-500 sm:text-base">Track purchases and access your order details in one place.</p>
        </div>
        <Link to="/shop" className="inline-flex w-fit items-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#b77e00]">Browse marketplace <span className="ml-2">→</span></Link>
      </div>

      <section className="mt-9 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-center gap-4 border-b border-zinc-100 pb-5 sm:pb-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-100 text-[#9a6a00]"><PackageIcon /></span>
          <div><h2 className="text-xl font-black tracking-tight sm:text-2xl">Order history</h2><p className="mt-1 text-sm text-zinc-500">{loading ? 'Checking your purchases…' : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}</p></div>
        </div>

        {loading ? <div className="space-y-4 py-7">
          {[1, 2].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-zinc-100" />)}
        </div> : error ? <div className="my-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-sm font-semibold text-red-700">{error}</div> : orders.length === 0 ? <div className="py-16 text-center sm:py-24">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-zinc-100 text-zinc-500"><PackageIcon /></span>
          <h2 className="mt-5 text-2xl font-black tracking-tight">No orders yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">Your purchases will appear here after you place your first order.</p>
          <Link to="/shop" className="mt-6 inline-flex rounded-full bg-yellow-300 px-6 py-3 text-sm font-black text-zinc-950 transition hover:bg-yellow-400">Explore games</Link>
        </div> : <div className="space-y-4 pt-6">
          {orders.map((order) => {
            const account = order.accounts || {};
            const status = (order.status || 'pending').toLowerCase();
            const title = account.title || account.name || (account.town_hall ? `Town Hall ${account.town_hall} Account` : 'Game account');
            const price = order.amount ?? order.total_amount ?? order.price ?? account.price;
            return <article key={order.id} className="group grid gap-5 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/60 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:p-5">
              <div className="h-32 overflow-hidden rounded-2xl bg-zinc-100 sm:h-28 sm:w-[120px]">
                {account.image_url ? <img src={account.image_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full w-full place-items-center text-zinc-400"><PackageIcon /></div>}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] ring-1 ${statusStyle[status] || statusStyle.pending}`}>{status}</span>
                  <span className="text-xs font-semibold text-zinc-400">Order #{String(order.id).slice(0, 8).toUpperCase()}</span>
                </div>
                <h3 className="mt-3 truncate text-lg font-black tracking-tight sm:text-xl">{title}</h3>
                <p className="mt-1 text-sm text-zinc-500">Purchased {formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center justify-between gap-5 border-t border-zinc-100 pt-4 sm:block sm:min-w-36 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 sm:text-right">
                <div><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total</p><p className="mt-1 text-2xl font-black">₹{Number(price || 0).toLocaleString('en-IN')}</p></div>
                {account.id ? <button onClick={() => navigate(`/account/${account.id}`)} className="mt-0 inline-flex items-center gap-1 text-sm font-bold text-[#a87300] transition hover:text-zinc-950 sm:mt-4">View details <ArrowIcon /></button> : <Link to="/support" className="mt-0 inline-flex items-center gap-1 text-sm font-bold text-[#a87300] transition hover:text-zinc-950 sm:mt-4">Get support <ArrowIcon /></Link>}
              </div>
            </article>;
          })}
        </div>}
      </section>

      <div className="mt-6 flex flex-col justify-between gap-4 rounded-3xl border border-zinc-200 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
        <div><h2 className="text-lg font-black">Need help with an order?</h2><p className="mt-1 text-sm leading-6 text-zinc-500">Send your order details to our support team.</p></div>
        <Link to="/support" className="inline-flex w-fit rounded-full border border-zinc-300 px-5 py-3 text-sm font-bold transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white">Contact support</Link>
      </div>
    </div>
  </main>;
}
