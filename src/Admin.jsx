import { cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from './lib/supabase';
import { MAX_LISTING_IMAGES, optimizeListingImage, validateListingFiles } from './lib/imageProcessing';
import AdminSupport from './pages/AdminSupport';
import AdminSellers from './pages/AdminSellers';
const games = [
  ['clash-of-clans', 'Clash of Clans'], ['brawl-stars', 'Brawl Stars'], ['valorant', 'Valorant'],
  ['clash-royale', 'Clash Royale'], ['fortnite', 'Fortnite'], ['pokemon-go', 'Pokémon GO'],
  ['mobile-legends', 'Mobile Legends'], ['free-fire', 'Free Fire'], ['hay-day', 'Hay Day'], ['squad-busters', 'Squad Busters'],
];
const listingTypes = [['account', 'Account'], ['item', 'Item'], ['service', 'Service']];
const platforms = ['Mobile', 'PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Cross-platform'];
const regions = ['Global', 'India', 'Asia', 'Europe', 'North America', 'South America', 'Middle East'];
const itemCategories = ['Currency', 'Top-up', 'Skin', 'Weapon', 'Card', 'Chest', 'Boost', 'Other'];
const serviceCategories = ['Rank boost', 'Coaching', 'Quest completion', 'Farming', 'Account setup', 'Other'];

const Icon = ({ name, className = 'h-5 w-5' }) => {
  const paths = {
    overview: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    inventory: <><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="M4 7v10l8 4 8-4V7M12 11v10" /></>,
    orders: <><path d="M5 4h14v16H5z" /><path d="M8 9h8M8 13h8M8 17h5" /></>,
    customers: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.2a4 4 0 0 1 0 7.6" /></>,
    support: <path d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9Z" />,
    sellers: <><path d="M4 10h16M5 10l1-5h12l1 5v9H5v-9Z" /><path d="M9 14h6" /></>,
    revenue: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13" /></>,
    edit: <><path d="m4 16-.8 4 4-.8L18 8.4 14.6 5 4 16Z" /><path d="m13.5 6.1 3.4 3.4" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v6H5V6h6" /></>,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">{paths[name]}</g></svg>;
};

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';
const gameName = (id) => games.find(([gameId]) => gameId === id)?.[1] || 'Clash of Clans';
const storagePathFromUrl = (url) => {
  const marker = '/account-images/';
  return url?.includes(marker) ? decodeURIComponent(url.split(marker)[1]) : null;
};

async function uploadListingImage(file, gameId) {
  const { full, thumbnail } = await optimizeListingImage(file);
  const key = crypto.randomUUID();
  const fullPath = `${gameId}/${key}.webp`;
  const thumbnailPath = `${gameId}/thumbnails/${key}.webp`;
  const bucket = supabase.storage.from('account-images');
  const { error: fullError } = await bucket.upload(fullPath, full, { cacheControl: '31536000', contentType: 'image/webp', upsert: false });
  if (fullError) throw fullError;
  const { error: thumbnailError } = await bucket.upload(thumbnailPath, thumbnail, { cacheControl: '31536000', contentType: 'image/webp', upsert: false });
  if (thumbnailError) {
    await bucket.remove([fullPath]);
    throw thumbnailError;
  }
  return {
    paths: [fullPath, thumbnailPath],
    url: bucket.getPublicUrl(fullPath).data.publicUrl,
    thumbnailUrl: bucket.getPublicUrl(thumbnailPath).data.publicUrl,
  };
}

export default function Admin() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [authorized, setAuthorized] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addListingType, setAddListingType] = useState('account');
  const [editingAccount, setEditingAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    const boot = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.user) {
        navigate('/login');
        return;
      }
      const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin');
      if (roleError || !isAdmin) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAdmin(session.user);
      setAuthorized(true);
      await fetchData();
    };
    boot();
    return () => { active = false; };
  }, [navigate]);

  async function fetchData() {
    setLoading(true);
    const [{ data: accountData, error: accountError }, { data: orderData, error: orderError }] = await Promise.all([
      supabase.from('accounts').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*, accounts(town_hall, game_id, image_url)').order('created_at', { ascending: false }),
    ]);
    if (accountError || orderError) setNotice('Some admin data could not be loaded. Refresh and try again.');
    setAccounts(accountData || []);
    setOrders(orderData || []);
    setLoading(false);
  }

  const customers = useMemo(() => {
    const grouped = new Map();
    orders.forEach((order) => {
      const email = order.buyer_email || 'Unknown buyer';
      const existing = grouped.get(email) || { email, orders: 0, spent: 0, lastOrder: order.created_at };
      existing.orders += 1;
      existing.spent += Number(order.amount || 0);
      if (new Date(order.created_at) > new Date(existing.lastOrder)) existing.lastOrder = order.created_at;
      grouped.set(email, existing);
    });
    return [...grouped.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const totalRevenue = orders.filter((order) => ['paid', 'delivered', 'completed'].includes(order.status)).reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const totalStock = accounts.filter((account) => account.status === 'available').length;
  const pendingOrders = orders.filter((order) => order.status === 'paid').length;
  const filteredAccounts = accounts.filter((account) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [account.title, account.game_id, account.listing_type, account.town_hall, account.price, account.status, ...Object.values(account.attributes || {})].some((value) => String(value || '').toLowerCase().includes(query));
    return matchesSearch && (gameFilter === 'all' || account.game_id === gameFilter) && (typeFilter === 'all' || (account.listing_type || 'account') === typeFilter) && (statusFilter === 'all' || account.status === statusFilter);
  });

  async function addAccount(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const imageFiles = Array.from(form.image.files || []);
    if (!imageFiles.length) {
      setNotice('Select at least one listing image.');
      return;
    }
    const validationError = validateListingFiles(imageFiles);
    if (validationError) {
      setNotice(validationError);
      return;
    }
    setSaving(true);
    setNotice('');
    const uploadedPaths = [];
    const imageUrls = [];
    const thumbnailUrls = [];

    for (const file of imageFiles) {
      try {
        const uploaded = await uploadListingImage(file, form.game.value);
        uploadedPaths.push(...uploaded.paths);
        imageUrls.push(uploaded.url);
        thumbnailUrls.push(uploaded.thumbnailUrl);
      } catch (uploadError) {
        if (uploadedPaths.length) await supabase.storage.from('account-images').remove(uploadedPaths);
        setSaving(false);
        setNotice(`Could not upload images: ${uploadError.message}`);
        return;
      }
    }

    const value = (name) => form.elements.namedItem(name)?.value?.trim() || '';
    const deliveryMethod = addListingType === 'service' ? 'scheduled' : value('deliveryMethod');
    const attributes = addListingType === 'account'
      ? { level: Number(value('level')) || null, rank: value('rank') || null, access: value('access') || null, features: value('features') || null }
      : addListingType === 'item'
        ? { item_name: value('itemName'), item_category: value('itemCategory'), quantity: Number(value('quantity')) || 1 }
        : { service_name: value('serviceName'), service_category: value('serviceCategory'), estimated_days: Number(value('estimatedDays')) || 1, requirements: value('requirements') || null };
    const payload = {
      seller_id: admin.id,
      moderation_status: 'approved',
      game_id: value('game'),
      title: value('title'),
      listing_type: addListingType,
      delivery_method: deliveryMethod,
      platform: value('platform') || null,
      region: value('region') || null,
      attributes,
      town_hall: addListingType === 'account' ? Number(value('level')) || null : null,
      heroes_level: addListingType === 'account' ? value('features') || null : null,
      full_email_access: addListingType === 'account' ? value('access') === 'Full email access' : false,
      instant_delivery: deliveryMethod === 'instant',
      price: Number(value('price')),
      original_price: Number(value('originalPrice')) || null,
      image_url: imageUrls[0],
      image_urls: imageUrls,
      thumbnail_url: thumbnailUrls[0],
      thumbnail_urls: thumbnailUrls,
      description: value('description') || null,
      status: 'available',
    };
    const { error } = await supabase.from('accounts').insert(payload);
    setSaving(false);
    if (error) {
      await supabase.storage.from('account-images').remove(uploadedPaths);
      setNotice(`Could not add listing: ${error.message}`);
      return;
    }
    form.reset();
    setAddListingType('account');
    setShowAddModal(false);
    setNotice('Listing added successfully.');
    fetchData();
  }

  async function deleteAccount(id) {
    if (!window.confirm('Delete this listing permanently? This cannot be undone.')) return;
    const listing = accounts.find((account) => account.id === id);
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) setNotice(`Could not delete listing: ${error.message}`);
    else {
      const fullImages = listing?.image_urls?.length ? listing.image_urls : [listing?.image_url].filter(Boolean);
      const thumbnails = listing?.thumbnail_urls?.length ? listing.thumbnail_urls : [listing?.thumbnail_url].filter(Boolean);
      const paths = [...fullImages, ...thumbnails].map(storagePathFromUrl).filter(Boolean);
      if (paths.length) await supabase.storage.from('account-images').remove(paths);
      fetchData();
    }
  }

  async function saveAccountEdits({ account, fields, gallery }) {
    if (!gallery.length) {
      setNotice('Keep or upload at least one listing image.');
      return;
    }
    setSaving(true);
    setNotice('');
    const uploadedPaths = [];
    const imageUrls = [];
    const thumbnailUrls = [];

    for (const image of gallery) {
      if (image.type === 'existing') {
        imageUrls.push(image.url);
        thumbnailUrls.push(image.thumbnail || image.url);
        continue;
      }
      try {
        const uploaded = await uploadListingImage(image.file, fields.game_id);
        uploadedPaths.push(...uploaded.paths);
        imageUrls.push(uploaded.url);
        thumbnailUrls.push(uploaded.thumbnailUrl);
      } catch (uploadError) {
        if (uploadedPaths.length) await supabase.storage.from('account-images').remove(uploadedPaths);
        setSaving(false);
        setNotice(`Could not upload new images: ${uploadError.message}`);
        return;
      }
    }

    const payload = { ...fields, image_url: imageUrls[0], image_urls: imageUrls, thumbnail_url: thumbnailUrls[0], thumbnail_urls: thumbnailUrls };
    const { data: updatedAccount, error } = await supabase
      .from('accounts')
      .update(payload)
      .eq('id', account.id)
      .select('*')
      .maybeSingle();
    if (error || !updatedAccount) {
      if (uploadedPaths.length) await supabase.storage.from('account-images').remove(uploadedPaths);
      setSaving(false);
      setNotice(error
        ? `Could not update listing: ${error.message}`
        : 'The listing was not updated. Run the admin listing update policy in Supabase, then try again.');
      return;
    }

    const oldImages = Array.isArray(account.image_urls) && account.image_urls.length ? account.image_urls : [account.image_url].filter(Boolean);
    const oldThumbnails = Array.isArray(account.thumbnail_urls) ? account.thumbnail_urls : [account.thumbnail_url].filter(Boolean);
    const removedPaths = oldImages.filter((url) => !imageUrls.includes(url)).map(storagePathFromUrl).filter(Boolean);
    const removedThumbnailPaths = oldThumbnails.filter((url) => !thumbnailUrls.includes(url)).map(storagePathFromUrl).filter(Boolean);
    if (removedPaths.length || removedThumbnailPaths.length) await supabase.storage.from('account-images').remove([...removedPaths, ...removedThumbnailPaths]);
    setAccounts((current) => current.map((item) => (item.id === updatedAccount.id ? updatedAccount : item)));
    setSaving(false);
    setEditingAccount(null);
    setNotice('Listing updated successfully.');
    await fetchData();
  }

  if (authorized === false) return <main className="grid min-h-screen place-items-center bg-zinc-50 px-5"><div className="max-w-md rounded-3xl border border-zinc-200 bg-white p-9 text-center shadow-sm"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600"><Icon name="customers" /></span><h1 className="mt-5 text-2xl font-black">Admin access required</h1><p className="mt-2 text-sm leading-6 text-zinc-500">This account is not authorized to open ClashVault administration.</p><Link to="/" className="mt-6 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold text-white">Return home</Link></div></main>;

  const navItems = [
    ['overview', 'Overview', 'overview'], ['inventory-editor', 'Inventory', 'inventory'], ['orders', 'Orders', 'orders'], ['sellers', 'Sellers', 'sellers'], ['customers', 'Customers', 'customers'], ['support', 'Support', 'support'],
  ];
  const navClass = (tab) => `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${activeTab === tab ? 'bg-zinc-950 text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950'}`;

  return <div className="min-h-screen bg-zinc-50 text-zinc-950">
    <aside className="border-b border-zinc-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex h-20 items-center justify-between px-5 lg:px-6"><Link to="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-yellow-300 text-xs font-black tracking-[-0.1em]">CV</span><span className="text-base font-black tracking-[0.08em]">CLASH<span className="text-[#b77e00]">VAULT</span></span></Link><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-500">Admin</span></div>
      <nav className="flex gap-2 overflow-x-auto border-t border-zinc-100 px-4 py-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-4 lg:py-6">{navItems.map(([tab, label, icon]) => <button key={tab} onClick={() => setActiveTab(tab)} className={navClass(tab)}><Icon name={icon} />{label}{tab === 'orders' && pendingOrders > 0 && <span className="ml-auto rounded-full bg-yellow-300 px-2 py-0.5 text-[10px] text-zinc-950">{pendingOrders}</span>}</button>)}</nav>
      <div className="hidden border-t border-zinc-100 p-4 lg:block"><div className="rounded-2xl bg-zinc-100 p-4"><p className="truncate text-sm font-black">{admin?.email?.split('@')[0] || 'Administrator'}</p><p className="mt-1 truncate text-xs text-zinc-500">{admin?.email}</p></div><Link to="/" className="mt-3 flex items-center gap-2 px-3 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-950"><Icon name="external" className="h-4 w-4" />View storefront</Link></div>
    </aside>

    <main className="lg:ml-64">
      <header className="border-b border-zinc-200 bg-white px-5 py-6 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl items-center justify-between gap-5"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b77e00]">Marketplace operations</p><h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{navItems.find(([tab]) => tab === activeTab)?.[1]}</h1></div><div className="flex items-center gap-2"><button onClick={fetchData} className="hidden rounded-full border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600 transition hover:border-zinc-400 sm:block">Refresh data</button><button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#b77e00] sm:px-5"><Icon name="plus" className="h-4 w-4" />Add listing</button></div></div></header>

      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
        {notice && <div className="mb-6 flex items-center justify-between rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-4 text-sm font-semibold text-yellow-900"><span>{notice}</span><button onClick={() => setNotice('')} className="ml-4 text-yellow-700"><Icon name="close" className="h-4 w-4" /></button></div>}

        {activeTab === 'overview' && <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Revenue', formatCurrency(totalRevenue), 'Paid and delivered orders', 'revenue', 'bg-yellow-100 text-[#9a6a00]'],
              ['Available stock', totalStock, `${accounts.length} total listings`, 'inventory', 'bg-blue-50 text-blue-600'],
              ['Total orders', orders.length, `${pendingOrders} awaiting delivery`, 'orders', 'bg-emerald-50 text-emerald-600'],
              ['Customers', customers.length, 'Unique purchasing buyers', 'customers', 'bg-violet-50 text-violet-600'],
            ].map(([label, value, detail, icon, color]) => <section key={label} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><p className="text-sm font-bold text-zinc-500">{label}</p><span className={`grid h-11 w-11 place-items-center rounded-2xl ${color}`}><Icon name={icon} /></span></div><p className="mt-6 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{loading ? '—' : value}</p><p className="mt-2 text-xs text-zinc-400">{detail}</p></section>)}
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Recent orders</h2><p className="mt-1 text-sm text-zinc-500">Latest marketplace purchases</p></div><button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#a87300]">View all →</button></div><div className="mt-5 divide-y divide-zinc-100">{orders.slice(0, 5).map((order) => <div key={order.id} className="flex items-center gap-4 py-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500"><Icon name="orders" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">#{order.id.slice(0, 8).toUpperCase()} · {gameName(order.accounts?.game_id)}</p><p className="mt-1 text-xs text-zinc-400">{order.buyer_email || 'Buyer'} · {formatDate(order.created_at)}</p></div><div className="text-right"><p className="text-sm font-black">{formatCurrency(order.amount)}</p><p className={`mt-1 text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.status}</p></div></div>)}{!loading && orders.length === 0 && <p className="py-14 text-center text-sm text-zinc-400">No orders yet.</p>}</div></section>
            <section className="rounded-3xl bg-zinc-950 p-7 text-white shadow-xl"><p className="text-xs font-black uppercase tracking-[0.16em] text-yellow-300">Quick actions</p><h2 className="mt-3 text-2xl font-black">Run your marketplace</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Add inventory, fulfil purchases, and answer buyers from one workspace.</p><div className="mt-7 space-y-3"><button onClick={() => setShowAddModal(true)} className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-4 text-sm font-black text-zinc-950">Create listing <span>→</span></button><button onClick={() => setActiveTab('orders')} className="flex w-full items-center justify-between rounded-2xl border border-white/10 px-4 py-4 text-sm font-bold">Process orders <span>→</span></button><button onClick={() => setActiveTab('support')} className="flex w-full items-center justify-between rounded-2xl border border-white/10 px-4 py-4 text-sm font-bold">Open support <span>→</span></button></div></section>
          </div>
        </>}

        {activeTab === 'inventory-editor' && <InventoryManager accounts={filteredAccounts} total={accounts.length} loading={loading} searchQuery={searchQuery} setSearchQuery={setSearchQuery} gameFilter={gameFilter} setGameFilter={setGameFilter} typeFilter={typeFilter} setTypeFilter={setTypeFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onEdit={setEditingAccount} onDelete={deleteAccount} />}

        {activeTab === 'inventory' && <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><h2 className="text-xl font-black">All listings</h2><p className="mt-1 text-sm text-zinc-500">{filteredAccounts.length} results</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3"><span className="text-zinc-400"><Icon name="search" className="h-4 w-4" /></span><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search inventory" className="min-w-0 bg-transparent text-sm outline-none" /></label><select value={gameFilter} onChange={(event) => setGameFilter(event.target.value)} className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold outline-none"><option value="all">All games</option>{games.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold outline-none"><option value="all">All status</option><option value="available">Available</option><option value="sold">Sold</option></select></div></div><AdminTableLoading loading={loading} />{!loading && <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-zinc-100 text-[10px] font-black uppercase tracking-wider text-zinc-400"><th className="px-6 py-4">Listing</th><th className="px-5 py-4">Game</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Added</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-zinc-100">{filteredAccounts.map((account) => <tr key={account.id} className="transition hover:bg-zinc-50"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="h-12 w-12 overflow-hidden rounded-xl bg-zinc-100">{account.image_url && <img src={account.image_url} alt="" className="h-full w-full object-cover" />}</span><div><p className="text-sm font-black">{account.title || `Level ${account.town_hall || '?'} Account`}</p><p className="mt-1 text-xs text-zinc-400">#{String(account.id).slice(0, 8).toUpperCase()}</p></div></div></td><td className="px-5 py-4 text-sm font-semibold text-zinc-600">{gameName(account.game_id)}</td><td className="px-5 py-4 text-sm font-black">{formatCurrency(account.price)}</td><td className="px-5 py-4"><StatusBadge status={account.status} /></td><td className="px-5 py-4 text-sm text-zinc-500">{formatDate(account.created_at)}</td><td className="px-6 py-4 text-right"><button onClick={() => deleteAccount(account.id)} className="rounded-xl p-2.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600" aria-label="Delete listing"><Icon name="trash" className="h-4 w-4" /></button></td></tr>)}</tbody></table>{filteredAccounts.length === 0 && <EmptyState icon="inventory" title="No listings found" text={searchQuery ? 'Try a different search.' : 'Add your first marketplace listing.'} />}</div>}</section>}

        {activeTab === 'orders' && <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="border-b border-zinc-100 p-5 sm:p-6"><h2 className="text-xl font-black">All orders</h2><p className="mt-1 text-sm text-zinc-500">Monitor seller delivery, buyer confirmation and disputes.</p></div><AdminTableLoading loading={loading} />{!loading && <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr className="border-b border-zinc-100 text-[10px] font-black uppercase tracking-wider text-zinc-400"><th className="px-6 py-4">Order</th><th className="px-5 py-4">Buyer</th><th className="px-5 py-4">Game</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Date</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-zinc-100">{orders.map((order) => <tr key={order.id} className="transition hover:bg-zinc-50"><td className="px-6 py-4 font-mono text-xs font-bold text-zinc-500">#{order.id.slice(0, 8).toUpperCase()}</td><td className="max-w-52 truncate px-5 py-4 text-sm font-semibold">{order.buyer_email || '—'}</td><td className="px-5 py-4 text-sm text-zinc-600">{gameName(order.accounts?.game_id)}</td><td className="px-5 py-4 text-sm font-black">{formatCurrency(order.amount)}</td><td className="px-5 py-4"><StatusBadge status={order.status} /></td><td className="px-5 py-4 text-sm text-zinc-500">{formatDate(order.created_at)}</td><td className="px-6 py-4 text-right"><span className="text-xs text-zinc-400">{order.status === 'paid' ? 'Awaiting seller' : order.status === 'disputed' ? 'Review in Sellers' : 'No action'}</span></td></tr>)}</tbody></table>{orders.length === 0 && <EmptyState icon="orders" title="No orders yet" text="New purchases will appear here." />}</div>}</section>}

        {activeTab === 'customers' && <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="border-b border-zinc-100 p-5 sm:p-6"><h2 className="text-xl font-black">Customers</h2><p className="mt-1 text-sm text-zinc-500">Buyer activity derived from marketplace orders.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead><tr className="border-b border-zinc-100 text-[10px] font-black uppercase tracking-wider text-zinc-400"><th className="px-6 py-4">Buyer</th><th className="px-5 py-4">Orders</th><th className="px-5 py-4">Total spent</th><th className="px-6 py-4">Last order</th></tr></thead><tbody className="divide-y divide-zinc-100">{customers.map((customer) => <tr key={customer.email} className="hover:bg-zinc-50"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-950 text-sm font-black text-white">{customer.email.charAt(0).toUpperCase()}</span><span className="text-sm font-bold">{customer.email}</span></div></td><td className="px-5 py-4 text-sm font-black">{customer.orders}</td><td className="px-5 py-4 text-sm font-black">{formatCurrency(customer.spent)}</td><td className="px-6 py-4 text-sm text-zinc-500">{formatDate(customer.lastOrder)}</td></tr>)}</tbody></table>{customers.length === 0 && <EmptyState icon="customers" title="No customers yet" text="Buyers will appear after their first order." />}</div></section>}

        {activeTab === 'sellers' && <AdminSellers />}

        {activeTab === 'support' && <AdminSupport />}
      </div>
    </main>

    {editingAccount && <EditListingModal key={editingAccount.id} account={editingAccount} saving={saving} onClose={() => setEditingAccount(null)} onSave={saveAccountEdits} />}

    {showAddModal && <AddListingModal listingType={addListingType} setListingType={setAddListingType} saving={saving} onClose={() => setShowAddModal(false)} onSubmit={addAccount} />}
  </div>;
}

function AddListingModal({ listingType, setListingType, saving, onClose, onSubmit }) {
  return <div className="fixed inset-0 z-[3000] overflow-y-auto bg-zinc-950/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
    <form onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()} className="relative mx-auto my-8 w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
      <button type="button" onClick={onClose} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50"><Icon name="close" /></button>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b77e00]">New inventory</p>
      <h2 className="mt-2 text-2xl font-black">Add marketplace listing</h2>
      <p className="mt-2 text-sm text-zinc-500">Choose a product type to see its relevant information and delivery options.</p>
      <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-zinc-100 p-1.5">{listingTypes.map(([value, label]) => <button key={value} type="button" onClick={() => setListingType(value)} className={`rounded-xl px-3 py-3 text-sm font-black transition ${listingType === value ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-950'}`}>{label}</button>)}</div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <AdminField label="Game"><select name="game" required>{games.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select></AdminField>
        <AdminField label="Listing title *"><input name="title" required placeholder={listingType === 'account' ? 'Example: TH15 Maxed Account' : listingType === 'item' ? 'Example: 1,000 Diamonds' : 'Example: Rank Boost to Diamond'} /></AdminField>
        <AdminField label="Platform"><select name="platform"><option value="">Any platform</option>{platforms.map((value) => <option key={value}>{value}</option>)}</select></AdminField>
        <AdminField label="Region"><select name="region"><option value="">Any region</option>{regions.map((value) => <option key={value}>{value}</option>)}</select></AdminField>
        {listingType === 'account' && <>
          <AdminField label="Primary level *"><input name="level" type="number" min="1" required placeholder="Example: 15" /></AdminField>
          <AdminField label="Rank"><input name="rank" placeholder="Example: Legendary" /></AdminField>
          <AdminField label="Account access"><select name="access"><option>Full email access</option><option>Login details only</option><option>Transfer assistance</option></select></AdminField>
          <AdminField label="Features"><input name="features" placeholder="Heroes, skins, rare items..." /></AdminField>
        </>}
        {listingType === 'item' && <>
          <AdminField label="Item name *"><input name="itemName" required placeholder="Example: Diamonds" /></AdminField>
          <AdminField label="Item category *"><select name="itemCategory" required>{itemCategories.map((value) => <option key={value}>{value}</option>)}</select></AdminField>
          <AdminField label="Quantity *"><input name="quantity" type="number" min="1" defaultValue="1" required /></AdminField>
        </>}
        {listingType === 'service' && <>
          <AdminField label="Service name *"><input name="serviceName" required placeholder="Example: Rank boost" /></AdminField>
          <AdminField label="Service category *"><select name="serviceCategory" required>{serviceCategories.map((value) => <option key={value}>{value}</option>)}</select></AdminField>
          <AdminField label="Estimated completion (days) *"><input name="estimatedDays" type="number" min="1" defaultValue="1" required /></AdminField>
          <AdminField label="Buyer requirements"><input name="requirements" placeholder="Details needed from buyer" /></AdminField>
        </>}
        {listingType !== 'service' && <AdminField label="Delivery method *"><select name="deliveryMethod" required><option value="seller_delivery">Seller delivery</option><option value="instant">Instant delivery</option></select></AdminField>}
        {listingType === 'service' && <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs font-semibold leading-5 text-blue-800">Services use scheduled delivery. The seller submits completion details after finishing the work.</div>}
        <AdminField label="Price (₹) *"><input name="price" type="number" min="1" required placeholder="2999" /></AdminField>
        <AdminField label="Original price (₹)"><input name="originalPrice" type="number" min="1" placeholder="Optional" /></AdminField>
        <AdminField label="Image URL"><input name="image" /></AdminField>
      </div>
      <AdminField label="Description" className="mt-5"><textarea name="description" rows="4" placeholder="Describe exactly what the buyer receives." /></AdminField>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-2xl border border-zinc-200 px-6 py-3.5 text-sm font-bold hover:bg-zinc-50">Cancel</button><button disabled={saving} className="rounded-2xl bg-zinc-950 px-7 py-3.5 text-sm font-black text-white disabled:opacity-60">{saving ? 'Adding…' : `Add ${listingType}`}</button></div>
    </form>
  </div>;
}

function InventoryManager({ accounts, total, loading, searchQuery, setSearchQuery, gameFilter, setGameFilter, typeFilter, setTypeFilter, statusFilter, setStatusFilter, onEdit, onDelete }) {
  return <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
    <div className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between"><div><h2 className="text-xl font-black">All listings</h2><p className="mt-1 text-sm text-zinc-500">{accounts.length} of {total} listings</p></div><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><label className="flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3"><span className="text-zinc-400"><Icon name="search" className="h-4 w-4" /></span><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search inventory" className="min-w-0 bg-transparent text-sm outline-none" /></label><select value={gameFilter} onChange={(event) => setGameFilter(event.target.value)} className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold outline-none"><option value="all">All games</option>{games.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold outline-none"><option value="all">All types</option>{listingTypes.map(([value, label]) => <option key={value} value={value}>{label}s</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold outline-none"><option value="all">All status</option><option value="available">Available</option><option value="sold">Sold</option></select></div></div>
    <AdminTableLoading loading={loading} />
    {!loading && <>{accounts.length ? <div className="divide-y divide-zinc-100">{accounts.map((account) => {
      const imageCount = account.image_urls?.length || (account.image_url ? 1 : 0);
      return <div key={account.id} className="grid gap-4 p-5 transition hover:bg-zinc-50 sm:grid-cols-[minmax(220px,1.5fr)_1fr_0.7fr_0.7fr_auto] sm:items-center sm:px-6">
        <div className="flex min-w-0 items-center gap-3"><span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100">{(account.thumbnail_url || account.image_url) && <img src={account.thumbnail_url || account.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />}{imageCount > 1 && <span className="absolute bottom-1 right-1 rounded-full bg-zinc-950 px-1.5 py-0.5 text-[8px] font-black text-white">+{imageCount - 1}</span>}</span><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-black">{account.title || `Level ${account.town_hall || '?'} Account`}</p><span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[8px] font-black uppercase text-zinc-500">{account.listing_type || 'account'}</span></div><p className="mt-1 text-xs text-zinc-400">#{String(account.id).slice(0, 8).toUpperCase()} · {imageCount} image{imageCount === 1 ? '' : 's'}</p></div></div>
        <div><p className="text-[9px] font-black uppercase tracking-wider text-zinc-400 sm:hidden">Game</p><p className="mt-1 text-sm font-semibold text-zinc-600 sm:mt-0">{gameName(account.game_id)}</p></div>
        <div><p className="text-[9px] font-black uppercase tracking-wider text-zinc-400 sm:hidden">Price</p><p className="mt-1 text-sm font-black sm:mt-0">{formatCurrency(account.price)}</p></div>
        <div><StatusBadge status={account.status} /></div>
        <div className="flex items-center justify-end gap-1 border-t border-zinc-100 pt-3 sm:border-0 sm:pt-0"><button onClick={() => onEdit(account)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-600 transition hover:bg-yellow-50 hover:text-[#8b6100]" aria-label="Edit listing"><Icon name="edit" className="h-4 w-4" /><span className="sm:hidden xl:inline">Edit</span></button><button onClick={() => onDelete(account.id)} className="rounded-xl p-2.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600" aria-label="Delete listing"><Icon name="trash" className="h-4 w-4" /></button></div>
      </div>;
    })}</div> : <EmptyState icon="inventory" title="No listings found" text={searchQuery ? 'Try a different search.' : 'Add your first marketplace listing.'} />}</>}
  </section>;
}

function EditListingModal({ account, saving, onClose, onSave }) {
  const existingImages = Array.isArray(account.image_urls) && account.image_urls.length ? account.image_urls : [account.image_url].filter(Boolean);
  const existingThumbnails = Array.isArray(account.thumbnail_urls) ? account.thumbnail_urls : [];
  const [gallery, setGallery] = useState(existingImages.map((url, index) => ({ id: url, type: 'existing', url, thumbnail: existingThumbnails[index] || url, preview: existingThumbnails[index] || url })));
  const [error, setError] = useState('');
  const [listingType, setListingType] = useState(account.listing_type || 'account');
  const inputClass = 'min-h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-[#c68d00] focus:bg-white focus:ring-4 focus:ring-yellow-100';

  function addPictures(event) {
    const files = Array.from(event.target.files || []);
    const validationError = validateListingFiles(files, gallery.length);
    if (validationError) {
      setError(validationError);
      event.target.value = '';
      return;
    }
    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: crypto.randomUUID(), type: 'new', file, preview: reader.result });
      reader.readAsDataURL(file);
    }))).then((pictures) => setGallery((current) => [...current, ...pictures]));
    setError('');
    event.target.value = '';
  }

  function makeCover(index) {
    setGallery((current) => [current[index], ...current.filter((_, itemIndex) => itemIndex !== index)]);
  }

  function moveImage(index, direction) {
    setGallery((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    if (!gallery.length) {
      setError('Keep or add at least one image.');
      return;
    }
    const form = event.currentTarget;
    const value = (name) => form.elements.namedItem(name)?.value?.trim() || '';
    const deliveryMethod = listingType === 'service' ? 'scheduled' : value('deliveryMethod');
    const attributes = listingType === 'account'
      ? { level: Number(value('level')) || null, rank: value('rank') || null, access: value('access') || null, features: value('features') || null }
      : listingType === 'item'
        ? { item_name: value('itemName'), item_category: value('itemCategory'), quantity: Number(value('quantity')) || 1 }
        : { service_name: value('serviceName'), service_category: value('serviceCategory'), estimated_days: Number(value('estimatedDays')) || 1, requirements: value('requirements') || null };
    await onSave({
      account,
      gallery,
      fields: {
        game_id: value('game'),
        title: value('title'),
        listing_type: listingType,
        delivery_method: deliveryMethod,
        platform: value('platform') || null,
        region: value('region') || null,
        attributes,
        town_hall: listingType === 'account' ? Number(value('level')) || null : null,
        heroes_level: listingType === 'account' ? value('features') || null : null,
        full_email_access: listingType === 'account' ? value('access') === 'Full email access' : false,
        instant_delivery: deliveryMethod === 'instant',
        price: Number(value('price')),
        original_price: Number(value('originalPrice')) || null,
        description: value('description') || null,
        status: value('status'),
      },
    });
  }

  return <div className="fixed inset-0 z-[3100] overflow-y-auto bg-zinc-950/50 p-4 backdrop-blur-sm" onMouseDown={onClose}><form onSubmit={submit} onMouseDown={(event) => event.stopPropagation()} className="relative mx-auto my-8 w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><button type="button" onClick={onClose} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50"><Icon name="close" /></button><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b77e00]">Inventory editor</p><h2 className="mt-2 text-2xl font-black">Edit listing</h2><p className="mt-2 text-sm text-zinc-500">Update listing information and manage its complete image gallery.</p>
    {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</p>}
    <div className="mt-7"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-zinc-700">Listing pictures</p><p className="mt-1 text-[10px] text-zinc-400">Use the arrows to set the buyer gallery order. Picture 1 is the cover.</p></div><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-black text-zinc-500">{gallery.length} / {MAX_LISTING_IMAGES}</span></div>{gallery.length > 0 && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{gallery.map((image, index) => <div key={image.id} className={`relative aspect-square overflow-hidden rounded-2xl border-2 bg-zinc-100 ${index === 0 ? 'border-zinc-950' : 'border-zinc-200'}`}><img src={image.preview} alt={`Listing picture ${index + 1}`} className="h-full w-full object-cover" /><span className="absolute left-2 top-2 rounded-full bg-zinc-950/80 px-2 py-1 text-[8px] font-black text-white">{index + 1}</span><div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-zinc-950/80 p-2 backdrop-blur"><div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => moveImage(index, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-xs text-white disabled:opacity-25" aria-label="Move image left">←</button><button type="button" disabled={index === gallery.length - 1} onClick={() => moveImage(index, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-xs text-white disabled:opacity-25" aria-label="Move image right">→</button></div>{index > 0 && <button type="button" onClick={() => makeCover(index)} className="text-[8px] font-black uppercase text-white">Cover</button>}<button type="button" onClick={() => setGallery((current) => current.filter((item) => item.id !== image.id))} className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-white hover:bg-red-500" aria-label="Remove image"><Icon name="close" className="h-3.5 w-3.5" /></button></div></div>)}</div>}<label className="mt-3 flex min-h-20 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 text-center transition hover:border-zinc-950 hover:bg-white"><span><span className="text-sm font-black">+ Add more pictures</span><span className="mt-1 block text-[10px] text-zinc-400">JPG, PNG or WebP · up to 12 MB · automatically optimized</span></span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPictures} className="sr-only" /></label></div>
    <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-zinc-100 p-1.5">{listingTypes.map(([value, label]) => <button key={value} type="button" onClick={() => setListingType(value)} className={`rounded-xl px-3 py-3 text-sm font-black transition ${listingType === value ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-500'}`}>{label}</button>)}</div>
    <div className="mt-7 grid gap-5 sm:grid-cols-2">
      <EditField label="Game" inputClass={inputClass}><select name="game" defaultValue={account.game_id || 'clash-of-clans'}>{games.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></EditField>
      <EditField label="Status" inputClass={inputClass}><select name="status" defaultValue={account.status || 'available'}><option value="available">Available</option><option value="sold">Sold</option></select></EditField>
      <EditField label="Listing title *" inputClass={inputClass}><input name="title" required defaultValue={account.title || ''} /></EditField>
      <EditField label="Platform" inputClass={inputClass}><select name="platform" defaultValue={account.platform || ''}><option value="">Any platform</option>{platforms.map((value) => <option key={value}>{value}</option>)}</select></EditField>
      <EditField label="Region" inputClass={inputClass}><select name="region" defaultValue={account.region || ''}><option value="">Any region</option>{regions.map((value) => <option key={value}>{value}</option>)}</select></EditField>
      {listingType === 'account' && <>
        <EditField label="Primary level *" inputClass={inputClass}><input name="level" type="number" min="1" required defaultValue={account.attributes?.level || account.town_hall || ''} /></EditField>
        <EditField label="Rank" inputClass={inputClass}><input name="rank" defaultValue={account.attributes?.rank || ''} /></EditField>
        <EditField label="Account access" inputClass={inputClass}><select name="access" defaultValue={account.attributes?.access || (account.full_email_access ? 'Full email access' : 'Login details only')}><option>Full email access</option><option>Login details only</option><option>Transfer assistance</option></select></EditField>
        <EditField label="Features" inputClass={inputClass}><input name="features" defaultValue={account.attributes?.features || account.heroes_level || ''} /></EditField>
      </>}
      {listingType === 'item' && <>
        <EditField label="Item name *" inputClass={inputClass}><input name="itemName" required defaultValue={account.attributes?.item_name || ''} /></EditField>
        <EditField label="Item category *" inputClass={inputClass}><select name="itemCategory" required defaultValue={account.attributes?.item_category || 'Currency'}>{itemCategories.map((value) => <option key={value}>{value}</option>)}</select></EditField>
        <EditField label="Quantity *" inputClass={inputClass}><input name="quantity" type="number" min="1" required defaultValue={account.attributes?.quantity || 1} /></EditField>
      </>}
      {listingType === 'service' && <>
        <EditField label="Service name *" inputClass={inputClass}><input name="serviceName" required defaultValue={account.attributes?.service_name || ''} /></EditField>
        <EditField label="Service category *" inputClass={inputClass}><select name="serviceCategory" required defaultValue={account.attributes?.service_category || 'Rank boost'}>{serviceCategories.map((value) => <option key={value}>{value}</option>)}</select></EditField>
        <EditField label="Estimated completion (days) *" inputClass={inputClass}><input name="estimatedDays" type="number" min="1" required defaultValue={account.attributes?.estimated_days || 1} /></EditField>
        <EditField label="Buyer requirements" inputClass={inputClass}><input name="requirements" defaultValue={account.attributes?.requirements || ''} /></EditField>
      </>}
      {listingType !== 'service' && <EditField label="Delivery method" inputClass={inputClass}><select name="deliveryMethod" defaultValue={account.delivery_method || 'seller_delivery'}><option value="seller_delivery">Seller delivery</option><option value="instant">Instant delivery</option></select></EditField>}
      <EditField label="Price (₹) *" inputClass={inputClass}><input name="price" type="number" min="1" required defaultValue={account.price || ''} /></EditField>
      <EditField label="Original price (₹)" inputClass={inputClass}><input name="originalPrice" type="number" min="1" defaultValue={account.original_price || ''} /></EditField>
    </div>
    <label className="mt-5 block"><span className="mb-2 block text-xs font-bold">Description</span><textarea name="description" rows="4" defaultValue={account.description || ''} className={`${inputClass} resize-none`} /></label>
    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-2xl border border-zinc-200 px-6 py-3.5 text-sm font-bold hover:bg-zinc-50">Cancel</button><button disabled={saving} className="rounded-2xl bg-zinc-950 px-7 py-3.5 text-sm font-black text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button></div>
  </form></div>;
}

function EditField({ label, inputClass, children }) {
  return <label><span className="mb-2 block text-xs font-bold">{label}</span>{cloneElement(children, { className: inputClass })}</label>;
}

function StatusBadge({ status = 'pending' }) {
  const style = status === 'available' || status === 'delivered' || status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : status === 'paid' ? 'bg-blue-50 text-blue-700 ring-blue-200' : status === 'sold' ? 'bg-violet-50 text-violet-700 ring-violet-200' : 'bg-amber-50 text-amber-700 ring-amber-200';
  return <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${style}`}>{status}</span>;
}

function EmptyState({ icon, title, text }) {
  return <div className="px-6 py-20 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-400"><Icon name={icon} /></span><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-2 text-sm text-zinc-500">{text}</p></div>;
}

function AdminTableLoading({ loading }) {
  if (!loading) return null;
  return <div className="space-y-3 p-6">{[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-zinc-100" />)}</div>;
}

function AdminField({ label, children, className = '' }) {
  const isImageUpload = label === 'Image URL';
  if (isImageUpload) return <ImageUploadInput className={className} />;
  const field = cloneElement(children, {
    className: `min-h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white placeholder:text-zinc-400 focus:border-[#c68d00] focus:bg-white focus:ring-4 focus:ring-yellow-100 ${children.type === 'textarea' ? 'resize-none' : ''}`,
  });
  return <label className={`block ${className}`}><span className="mb-2 block text-xs font-bold text-zinc-700">{label}</span>{field}</label>;
}

function ImageUploadInput({ className = '' }) {
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function syncFiles(next) {
    const transfer = new DataTransfer();
    next.forEach((preview) => transfer.items.add(preview.file));
    if (inputRef.current) inputRef.current.files = transfer.files;
    setPreviews(next);
  }

  function previewImages(event) {
    previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    const files = Array.from(event.target.files || []);
    const validationError = validateListingFiles(files);
    if (validationError) {
      setError(validationError);
      event.target.value = '';
      setPreviews([]);
      return;
    }
    setError('');
    setPreviews(files.map((file) => ({ id: crypto.randomUUID(), name: file.name, file, url: URL.createObjectURL(file) })));
  }

  function movePreview(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= previews.length) return;
    const next = [...previews];
    [next[index], next[target]] = [next[target], next[index]];
    syncFiles(next);
  }

  function removePreview(index) {
    URL.revokeObjectURL(previews[index].url);
    syncFiles(previews.filter((_, itemIndex) => itemIndex !== index));
  }

  return <div className={`sm:col-span-2 ${className}`}>
    <label className="block"><span className="mb-2 block text-xs font-bold text-zinc-700">Listing images *</span><span className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-5 py-6 text-center transition hover:border-zinc-950 hover:bg-white"><span className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-950 text-white"><Icon name="plus" /></span><span className="mt-3 text-sm font-black">Choose high-quality images</span><span className="mt-1 text-[11px] text-zinc-400">Up to {MAX_LISTING_IMAGES} JPG, PNG, or WebP files · 12 MB each</span><span className="mt-1 text-[10px] font-semibold text-emerald-600">Automatically compressed to sharp WebP with fast thumbnails</span><input ref={inputRef} name="image" type="file" accept="image/jpeg,image/png,image/webp" multiple required onChange={previewImages} className="sr-only" /></span></label>
    {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    {previews.length > 0 && <div className="mt-3"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-zinc-600">Gallery order · first picture is the cover</span><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-black text-zinc-500">{previews.length} / {MAX_LISTING_IMAGES}</span></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{previews.map((preview, index) => <div key={preview.id} className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-zinc-100 ${index === 0 ? 'border-zinc-950' : 'border-zinc-200'}`}><img src={preview.url} alt={`Selected picture ${index + 1}`} className="h-full w-full object-cover" /><span className="absolute left-1.5 top-1.5 rounded-full bg-zinc-950/80 px-2 py-1 text-[8px] font-black text-white">{index + 1}</span><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-zinc-950/80 p-1.5"><div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => movePreview(index, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-xs text-white disabled:opacity-25" aria-label="Move image left">←</button><button type="button" disabled={index === previews.length - 1} onClick={() => movePreview(index, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-xs text-white disabled:opacity-25" aria-label="Move image right">→</button></div><button type="button" onClick={() => removePreview(index)} className="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-white hover:bg-red-500" aria-label="Remove image"><Icon name="close" className="h-3.5 w-3.5" /></button></div></div>)}</div></div>}
  </div>;
}
