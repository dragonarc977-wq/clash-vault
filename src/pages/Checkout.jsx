import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import supabase from '../lib/supabase';

const ShieldIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 12 2 2 4-4" /></svg>;
const CheckIcon = () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="m5 12 4 4L19 6" /></svg>;

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [{ data: authData }, { data: listing, error: listingError }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from('accounts').select('id,title,price,original_price,image_url,thumbnail_url,status,moderation_status,game_id,listing_type').eq('id', id).maybeSingle(),
      ]);
      if (!active) return;
      if (!authData.session?.user) {
        navigate('/login', { replace: true });
        return;
      }
      setUser(authData.session.user);
      if (listingError || !listing || listing.status !== 'available' || (listing.moderation_status && listing.moderation_status !== 'approved')) {
        setError('This listing is no longer available for purchase.');
      } else {
        setAccount(listing);
      }
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [id, navigate]);

  const startPayment = async () => {
    if (paying || !account) return;
    if (!acceptedTerms) { setError('Confirm the Terms, Refund Policy and transfer-risk disclosure before paying.'); return; }
    setPaying(true);
    setError('');
    try {
      const [{ data: sessionData }, scriptReady] = await Promise.all([supabase.auth.getSession(), loadRazorpay()]);
      const session = sessionData.session;
      if (!session?.access_token) {
        navigate('/login');
        return;
      }
      if (!scriptReady) throw new Error('The secure payment window could not load. Check your connection and try again.');

      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id, termsAccepted: true, termsVersion: '2026-09-15' }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || 'We could not start the payment. Please try again.');

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'AllGamersMarket',
        description: `Purchase: ${account.title || 'Gaming listing'}`.slice(0, 255),
        image: `${window.location.origin}/favicon.svg`,
        order_id: order.orderId,
        prefill: {
          name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
          email: user?.email || '',
          contact: user?.user_metadata?.phone || '',
        },
        notes: { account_id: account.id, buyer_id: user.id, buyer_email: user.email || '' },
        theme: { color: '#18181b', backdrop_color: '#09090bcc' },
        modal: { backdropclose: false, ondismiss: () => setPaying(false) },
        handler: async (payment) => {
          try {
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(payment),
            });
            const result = await verifyResponse.json();
            if (!verifyResponse.ok || !result.verified) throw new Error(result.error || 'Payment confirmation is still processing.');
            navigate(`/my-orders?payment=${result.fulfilled ? 'success' : 'pending'}`, { replace: true });
          } catch {
            navigate('/my-orders?payment=pending', { replace: true });
          }
        },
      });
      checkout.on('payment.failed', (response) => {
        setPaying(false);
        setError(response.error?.description || 'The payment was not completed. No order has been created.');
      });
      checkout.open();
    } catch (paymentError) {
      setError(paymentError.message || 'We could not start the payment. Please try again.');
      setPaying(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-28"><div className="mx-auto max-w-5xl animate-pulse"><div className="h-8 w-52 rounded bg-zinc-200" /><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]"><div className="h-72 rounded-3xl bg-white" /><div className="h-72 rounded-3xl bg-white" /></div></div></main>;

  const image = account?.thumbnail_url || account?.image_url;
  const price = Number(account?.price || 0);
  const originalPrice = Number(account?.original_price || 0);

  return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-24 text-zinc-950 sm:px-8 sm:pt-28">
    <div className="mx-auto max-w-5xl">
      <Link to={account ? `/account/${account.id}` : '/'} className="text-sm font-bold text-zinc-500 transition hover:text-zinc-950">← Back to listing</Link>
      <div className="mt-5 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><ShieldIcon /></span><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Protected checkout</p><h1 className="text-2xl font-black tracking-[-0.04em] sm:text-3xl">Review and pay</h1></div></div>

      {error && !account ? <section className="mt-8 rounded-3xl border border-red-200 bg-white p-7 text-center shadow-sm"><p className="font-bold text-red-700">{error}</p><Link to="/" className="mt-5 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white">Browse available listings</Link></section> : account && <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-black">Your purchase</h2>
          <div className="mt-5 grid gap-4 border-y border-zinc-100 py-5 sm:grid-cols-[120px_1fr] sm:items-center">
            <div className="h-28 overflow-hidden rounded-2xl bg-zinc-100">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-3xl">🎮</div>}</div>
            <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{String(account.listing_type || 'account')} · {String(account.game_id || 'game').replaceAll('-', ' ')}</p><h2 className="mt-2 text-lg font-black leading-6">{account.title || 'Gaming listing'}</h2><p className="mt-2 text-xs text-zinc-500">Listing #{String(account.id).slice(0, 8).toUpperCase()}</p></div>
          </div>
          <div className="mt-6 space-y-4">{['The price is verified on our server before payment.', 'Your order is created only after Razorpay confirms a captured payment.', 'Support and tracked delivery remain available from My orders.'].map((item) => <div key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-600"><span className="mt-1 text-emerald-600"><CheckIcon /></span><span>{item}</span></div>)}</div>
        </section>

        <aside className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7 lg:sticky lg:top-24">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">Total amount</p>
          <div className="mt-2 flex items-baseline gap-2"><span className="text-4xl font-black tracking-[-0.06em]">₹{price.toLocaleString('en-IN')}</span>{originalPrice > price && <span className="text-sm text-zinc-400 line-through">₹{originalPrice.toLocaleString('en-IN')}</span>}</div>
          <p className="mt-2 text-xs text-zinc-500">Inclusive of applicable charges</p>
          <div className="my-6 border-t border-zinc-100" />
          {String(account.listing_type || 'account').toLowerCase() === 'account' && <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950"><b>High-risk digital transfer.</b> Many publishers prohibit account sales and may suspend, close or recover an account. Payment does not override publisher rules.</div>}
          <label className="mb-5 flex items-start gap-3 text-xs leading-5 text-zinc-600"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-zinc-950" /><span>I am 18+, the publisher permits this transaction, and I agree to the <Link to="/terms" target="_blank" className="font-bold underline">Terms</Link>, <Link to="/refund-policy" target="_blank" className="font-bold underline">Refund Policy</Link> and <Link to="/account-transfer-risks" target="_blank" className="font-bold underline">Transfer Risk Disclosure</Link>.</span></label>
          <button onClick={startPayment} disabled={paying || !acceptedTerms} className="w-full rounded-2xl bg-zinc-950 px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45">{paying ? 'Opening secure payment…' : `Pay ₹${price.toLocaleString('en-IN')}`}</button>
          <p className="mt-4 text-center text-[11px] leading-5 text-zinc-500">Available payment methods are shown securely by Razorpay. We never receive or store your card or UPI credentials.</p>
          <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700"><ShieldIcon />Encrypted payment</div>
          {error && <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold leading-5 text-red-700">{error}</p>}
          <p className="mt-5 text-center text-[10px] leading-4 text-zinc-400">Your acceptance is required before the payment window can open.</p>
        </aside>
      </div>}
    </div>
  </main>;
}
