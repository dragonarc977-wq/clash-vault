'use client';

import { cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from './lib/navigation';
import supabase from './lib/supabase';
import { MAX_LISTING_IMAGES, optimizeListingImage, validateListingFiles } from './lib/imageProcessing';
import { accountFieldValue, clashHeroSummary, getAccountFields } from './lib/listingOptions';
import AdminSupport from './views/AdminSupport';
import AdminSellers from './views/AdminSellers';
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

const Icon = ({ name, className = 'admin-icon' }) => {
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

export default function Admin({ initialAdmin = null, initialAuthorized = null }) {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(initialAdmin);
  const [authorized, setAuthorized] = useState(initialAuthorized);
  const [accounts, setAccounts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addListingType, setAddListingType] = useState('account');
  const [addGame, setAddGame] = useState('clash-of-clans');
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
      if (initialAuthorized === true) {
        await fetchData();
        return;
      }

      if (initialAuthorized === false) {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session?.user) {
        navigate('/login?next=/admin', { replace: true });
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
  }, [initialAuthorized, navigate]);

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
      ? getAccountFields(value('game')).reduce((details, field) => ({ ...details, [field.key]: field.type === 'number' ? Number(value(field.key)) || null : value(field.key) || null }), { access: value('access') || null })
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
      town_hall: addListingType === 'account' ? Number(attributes[getAccountFields(value('game')).find((field) => field.type === 'number')?.key]) || null : null,
      builder_hall: addListingType === 'account' ? Number(attributes.builder_hall) || null : null,
      exp_level: addListingType === 'account' ? Number(attributes.experience_level || attributes.account_level || attributes.trainer_level || attributes.farm_level) || null : null,
      gems: addListingType === 'account' ? Number(attributes.gems || attributes.diamonds || attributes.v_bucks || attributes.coins) || null : null,
      heroes_level: addListingType === 'account' ? clashHeroSummary(attributes) || attributes.rare_skins || null : null,
      walls_level: addListingType === 'account' ? attributes.walls_level || attributes.rank || attributes.highest_rank || null : null,
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
    setAddGame('clash-of-clans');
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

  if (authorized === null) return <main className="admin-denied" aria-busy="true" aria-label="Checking admin access" />;

  if (authorized === false) return <main className="admin-denied"><div className="admin-denied-card"><span className="admin-denied-icon"><Icon name="customers" /></span><h1 className="admin-denied-title">Admin access required</h1><p className="admin-denied-text">This account is not authorized to open AllGamersMarket administration.</p><Link to="/" className="admin-denied-home">Return home</Link></div></main>;

  const navItems = [
    ['overview', 'Overview', 'overview'], ['inventory-editor', 'Inventory', 'inventory'], ['orders', 'Orders', 'orders'], ['sellers', 'Sellers', 'sellers'], ['customers', 'Customers', 'customers'], ['support', 'Support', 'support'],
  ];
  const navClass = (tab) => `admin-nav-item${activeTab === tab ? ' is-active' : ''}`;

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <div className="admin-brand-row"><Link to="/" className="admin-ui-001"><span className="admin-brand-mark">CV</span><span className="admin-brand-name">CLASH<span className="admin-brand-accent">VAULT</span></span></Link><span className="admin-role-badge">Admin</span></div>
      <nav className="admin-nav">{navItems.map(([tab, label, icon]) => <button key={tab} onClick={() => setActiveTab(tab)} className={navClass(tab)}><Icon name={icon} />{label}{tab === 'orders' && pendingOrders > 0 && <span className="admin-nav-count">{pendingOrders}</span>}</button>)}</nav>
      <div className="admin-sidebar-footer"><div className="admin-user-card"><p className="admin-ui-002">{admin?.email?.split('@')[0] || 'Administrator'}</p><p className="admin-ui-003">{admin?.email}</p></div><Link to="/" className="admin-store-link"><Icon name="external" className="admin-icon-sm" />View storefront</Link></div>
    </aside>

    <main className="admin-main">
      <header className="admin-header"><div className="admin-header-inner"><div><p className="admin-eyebrow">Marketplace operations</p><h1 className="admin-page-title">{navItems.find(([tab]) => tab === activeTab)?.[1]}</h1></div><div className="admin-ui-004"><button onClick={fetchData} className="admin-refresh-button">Refresh data</button><button onClick={() => setShowAddModal(true)} className="admin-add-button"><Icon name="plus" className="admin-icon-sm" />Add listing</button></div></div></header>

      <div className="admin-content">
        {notice && <div className="admin-notice"><span>{notice}</span><button onClick={() => setNotice('')} className="admin-notice-close"><Icon name="close" className="admin-icon-sm" /></button></div>}

        {activeTab === 'overview' && <>
          <div className="admin-stats-grid">
            {[
              ['Revenue', formatCurrency(totalRevenue), 'Paid and delivered orders', 'revenue', 'revenue'],
              ['Available stock', totalStock, `${accounts.length} total listings`, 'inventory', 'stock'],
              ['Total orders', orders.length, `${pendingOrders} awaiting delivery`, 'orders', 'orders'],
              ['Customers', customers.length, 'Unique purchasing buyers', 'customers', 'customers'],
            ].map(([label, value, detail, icon, color]) => <section key={label} className="admin-stat-card"><div className="admin-stat-top"><p className="admin-stat-label">{label}</p><span className={`admin-stat-icon admin-stat-icon--${color}`}><Icon name={icon} /></span></div><p className="admin-stat-value">{loading ? '—' : value}</p><p className="admin-stat-detail">{detail}</p></section>)}
          </div>
          <div className="admin-overview-grid">
            <section className="admin-stat-card"><div className="admin-ui-005"><div><h2 className="admin-panel-title">Recent orders</h2><p className="admin-panel-subtitle">Latest marketplace purchases</p></div><button onClick={() => setActiveTab('orders')} className="admin-link-button">View all →</button></div><div className="admin-recent-list">{orders.slice(0, 5).map((order) => <div key={order.id} className="admin-recent-row"><span className="admin-recent-icon"><Icon name="orders" /></span><div className="admin-grow-min"><p className="admin-recent-title">#{order.id.slice(0, 8).toUpperCase()} · {gameName(order.accounts?.game_id)}</p><p className="admin-ui-006">{order.buyer_email || 'Buyer'} · {formatDate(order.created_at)}</p></div><div className="admin-text-right"><p className="admin-ui-007">{formatCurrency(order.amount)}</p><p className={`admin-order-status ${order.status === 'delivered' ? 'is-success' : 'is-pending'}`}>{order.status}</p></div></div>)}{!loading && orders.length === 0 && <p className="admin-empty-inline">No orders yet.</p>}</div></section>
            <section className="admin-quick-card"><p className="admin-quick-eyebrow">Quick actions</p><h2 className="admin-quick-title">Run your marketplace</h2><p className="admin-quick-text">Add inventory, fulfil purchases, and answer buyers from one workspace.</p><div className="admin-quick-actions"><button onClick={() => setShowAddModal(true)} className="admin-quick-primary">Create listing <span>→</span></button><button onClick={() => setActiveTab('orders')} className="admin-quick-secondary">Process orders <span>→</span></button><button onClick={() => setActiveTab('support')} className="admin-quick-secondary">Open support <span>→</span></button></div></section>
          </div>
        </>}

        {activeTab === 'inventory-editor' && <InventoryManager accounts={filteredAccounts} total={accounts.length} loading={loading} searchQuery={searchQuery} setSearchQuery={setSearchQuery} gameFilter={gameFilter} setGameFilter={setGameFilter} typeFilter={typeFilter} setTypeFilter={setTypeFilter} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onEdit={setEditingAccount} onDelete={deleteAccount} />}

        {activeTab === 'inventory' && <section className="admin-panel"><div className="admin-ui-008"><div><h2 className="admin-panel-title">All listings</h2><p className="admin-panel-subtitle">{filteredAccounts.length} results</p></div><div className="admin-ui-009"><label className="admin-ui-010"><span className="admin-ui-011"><Icon name="search" className="admin-icon-sm" /></span><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search inventory" className="admin-ui-012" /></label><select value={gameFilter} onChange={(event) => setGameFilter(event.target.value)} className="admin-ui-013"><option value="all">All games</option>{games.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="admin-ui-013"><option value="all">All status</option><option value="available">Available</option><option value="sold">Sold</option></select></div></div><AdminTableLoading loading={loading} />{!loading && <div className="admin-table-scroll"><table className="admin-ui-014"><thead><tr className="admin-ui-015"><th className="admin-ui-016">Listing</th><th className="admin-ui-017">Game</th><th className="admin-ui-017">Price</th><th className="admin-ui-017">Status</th><th className="admin-ui-017">Added</th><th className="admin-ui-018">Action</th></tr></thead><tbody className="admin-ui-019">{filteredAccounts.map((account) => <tr key={account.id} className="admin-ui-020"><td className="admin-ui-016"><div className="admin-ui-001"><span className="admin-ui-021">{account.image_url && <img src={account.image_url} alt="" className="admin-cover-image" />}</span><div><p className="admin-ui-007">{account.title || `Level ${account.town_hall || '?'} Account`}</p><p className="admin-ui-006">#{String(account.id).slice(0, 8).toUpperCase()}</p></div></div></td><td className="admin-ui-022">{gameName(account.game_id)}</td><td className="admin-ui-023">{formatCurrency(account.price)}</td><td className="admin-ui-017"><StatusBadge status={account.status} /></td><td className="admin-ui-024">{formatDate(account.created_at)}</td><td className="admin-ui-018"><button onClick={() => deleteAccount(account.id)} className="admin-ui-025" aria-label="Delete listing"><Icon name="trash" className="admin-icon-sm" /></button></td></tr>)}</tbody></table>{filteredAccounts.length === 0 && <EmptyState icon="inventory" title="No listings found" text={searchQuery ? 'Try a different search.' : 'Add your first marketplace listing.'} />}</div>}</section>}

        {activeTab === 'orders' && <section className="admin-panel"><div className="admin-ui-026"><h2 className="admin-panel-title">All orders</h2><p className="admin-panel-subtitle">Monitor seller delivery, buyer confirmation and disputes.</p></div><AdminTableLoading loading={loading} />{!loading && <div className="admin-table-scroll"><table className="admin-ui-027"><thead><tr className="admin-ui-015"><th className="admin-ui-016">Order</th><th className="admin-ui-017">Buyer</th><th className="admin-ui-017">Game</th><th className="admin-ui-017">Amount</th><th className="admin-ui-017">Status</th><th className="admin-ui-017">Date</th><th className="admin-ui-018">Action</th></tr></thead><tbody className="admin-ui-019">{orders.map((order) => <tr key={order.id} className="admin-ui-020"><td className="admin-ui-028">#{order.id.slice(0, 8).toUpperCase()}</td><td className="admin-ui-029">{order.buyer_email || '—'}</td><td className="admin-ui-030">{gameName(order.accounts?.game_id)}</td><td className="admin-ui-023">{formatCurrency(order.amount)}</td><td className="admin-ui-017"><StatusBadge status={order.status} /></td><td className="admin-ui-024">{formatDate(order.created_at)}</td><td className="admin-ui-018"><span className="admin-ui-031">{order.status === 'paid' ? 'Awaiting seller' : order.status === 'disputed' ? 'Review in Sellers' : 'No action'}</span></td></tr>)}</tbody></table>{orders.length === 0 && <EmptyState icon="orders" title="No orders yet" text="New purchases will appear here." />}</div>}</section>}

        {activeTab === 'customers' && <section className="admin-panel"><div className="admin-ui-026"><h2 className="admin-panel-title">Customers</h2><p className="admin-panel-subtitle">Buyer activity derived from marketplace orders.</p></div><div className="admin-table-scroll"><table className="admin-ui-032"><thead><tr className="admin-ui-015"><th className="admin-ui-016">Buyer</th><th className="admin-ui-017">Orders</th><th className="admin-ui-017">Total spent</th><th className="admin-ui-016">Last order</th></tr></thead><tbody className="admin-ui-019">{customers.map((customer) => <tr key={customer.email} className="admin-ui-033"><td className="admin-ui-016"><div className="admin-ui-001"><span className="admin-ui-034">{customer.email.charAt(0).toUpperCase()}</span><span className="admin-ui-035">{customer.email}</span></div></td><td className="admin-ui-023">{customer.orders}</td><td className="admin-ui-023">{formatCurrency(customer.spent)}</td><td className="admin-ui-036">{formatDate(customer.lastOrder)}</td></tr>)}</tbody></table>{customers.length === 0 && <EmptyState icon="customers" title="No customers yet" text="Buyers will appear after their first order." />}</div></section>}

        {activeTab === 'sellers' && <AdminSellers />}

        {activeTab === 'support' && <AdminSupport />}
      </div>
    </main>

    {editingAccount && <EditListingModal key={editingAccount.id} account={editingAccount} saving={saving} onClose={() => setEditingAccount(null)} onSave={saveAccountEdits} />}

    {showAddModal && <AddListingModal listingType={addListingType} setListingType={setAddListingType} gameId={addGame} setGameId={setAddGame} saving={saving} onClose={() => setShowAddModal(false)} onSubmit={addAccount} />}
  </div>;
}

function AddListingModal({ listingType, setListingType, gameId, setGameId, saving, onClose, onSubmit }) {
  return <div className="admin-modal-overlay" onMouseDown={onClose}>
    <form onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()} className="admin-modal">
      <button type="button" onClick={onClose} className="admin-modal-close"><Icon name="close" /></button>
      <p className="admin-eyebrow">New inventory</p>
      <h2 className="admin-modal-title">Add marketplace listing</h2>
      <p className="admin-modal-subtitle">Choose a product type to see its relevant information and delivery options.</p>
      <div className="admin-type-tabs">{listingTypes.map(([value, label]) => <button key={value} type="button" onClick={() => setListingType(value)} className={`admin-type-tab${listingType === value ? ' is-active' : ''}`}>{label}</button>)}</div>
      <div className="admin-form-grid">
        <AdminField label="Game"><select name="game" required value={gameId} onChange={(event) => setGameId(event.target.value)}>{games.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select></AdminField>
        <AdminField label="Listing title *"><input name="title" required placeholder={listingType === 'account' ? 'Example: TH15 Maxed Account' : listingType === 'item' ? 'Example: 1,000 Diamonds' : 'Example: Rank Boost to Diamond'} /></AdminField>
        <AdminField label="Platform"><select name="platform"><option value="">Any platform</option>{platforms.map((value) => <option key={value}>{value}</option>)}</select></AdminField>
        <AdminField label="Region"><select name="region"><option value="">Any region</option>{regions.map((value) => <option key={value}>{value}</option>)}</select></AdminField>
        {listingType === 'account' && <><AdminField label="Account access"><select name="access"><option>Full email access</option><option>Game login only</option><option>Transfer assistance</option></select></AdminField>{getAccountFields(gameId).map((field) => <AdminField key={`${gameId}-${field.key}`} label={`${field.label}${field.required ? ' *' : ''}`}><input name={field.key} type={field.type} min={field.type === 'number' ? 0 : undefined} required={field.required} placeholder={field.placeholder} /></AdminField>)}</>}
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
        {listingType === 'service' && <div className="admin-service-note">Services use scheduled delivery. The seller submits completion details after finishing the work.</div>}
        <AdminField label="Price (₹) *"><input name="price" type="number" min="1" required placeholder="2999" /></AdminField>
        <AdminField label="Original price (₹)"><input name="originalPrice" type="number" min="1" placeholder="Optional" /></AdminField>
        <AdminField label="Image URL"><input name="image" /></AdminField>
      </div>
      <AdminField label="Description" className="admin-ui-037"><textarea name="description" rows="4" placeholder="Describe exactly what the buyer receives." /></AdminField>
      <div className="admin-form-actions"><button type="button" onClick={onClose} className="admin-button-secondary">Cancel</button><button disabled={saving} className="admin-button-primary">{saving ? 'Adding…' : `Add ${listingType}`}</button></div>
    </form>
  </div>;
}

function InventoryManager({ accounts, total, loading, searchQuery, setSearchQuery, gameFilter, setGameFilter, typeFilter, setTypeFilter, statusFilter, setStatusFilter, onEdit, onDelete }) {
  return <section className="admin-panel">
    <div className="admin-ui-038"><div><h2 className="admin-panel-title">All listings</h2><p className="admin-panel-subtitle">{accounts.length} of {total} listings</p></div><div className="admin-ui-039"><label className="admin-ui-010"><span className="admin-ui-011"><Icon name="search" className="admin-icon-sm" /></span><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search inventory" className="admin-ui-012" /></label><select value={gameFilter} onChange={(event) => setGameFilter(event.target.value)} className="admin-ui-013"><option value="all">All games</option>{games.map(([id, name]) => <option value={id} key={id}>{name}</option>)}</select><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="admin-ui-013"><option value="all">All types</option>{listingTypes.map(([value, label]) => <option key={value} value={value}>{label}s</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="admin-ui-013"><option value="all">All status</option><option value="available">Available</option><option value="sold">Sold</option></select></div></div>
    <AdminTableLoading loading={loading} />
    {!loading && <>{accounts.length ? <div className="admin-ui-019">{accounts.map((account) => {
      const imageCount = account.image_urls?.length || (account.image_url ? 1 : 0);
      return <div key={account.id} className="admin-ui-040">
        <div className="admin-ui-041"><span className="admin-ui-042">{(account.thumbnail_url || account.image_url) && <img src={account.thumbnail_url || account.image_url} alt="" className="admin-cover-image" loading="lazy" />}{imageCount > 1 && <span className="admin-ui-043">+{imageCount - 1}</span>}</span><div className="admin-ui-044"><div className="admin-ui-004"><p className="admin-ui-002">{account.title || `Level ${account.town_hall || '?'} Account`}</p><span className="admin-ui-045">{account.listing_type || 'account'}</span></div><p className="admin-ui-006">#{String(account.id).slice(0, 8).toUpperCase()} · {imageCount} image{imageCount === 1 ? '' : 's'}</p></div></div>
        <div><p className="admin-ui-046">Game</p><p className="admin-ui-047">{gameName(account.game_id)}</p></div>
        <div><p className="admin-ui-046">Price</p><p className="admin-ui-048">{formatCurrency(account.price)}</p></div>
        <div><StatusBadge status={account.status} /></div>
        <div className="admin-ui-049"><button onClick={() => onEdit(account)} className="admin-ui-050" aria-label="Edit listing"><Icon name="edit" className="admin-icon-sm" /><span className="admin-ui-051">Edit</span></button><button onClick={() => onDelete(account.id)} className="admin-ui-025" aria-label="Delete listing"><Icon name="trash" className="admin-icon-sm" /></button></div>
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
  const [gameId, setGameId] = useState(account.game_id || 'clash-of-clans');
  const inputClass = 'admin-form-control';

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
      ? getAccountFields(value('game')).reduce((details, field) => ({ ...details, [field.key]: field.type === 'number' ? Number(value(field.key)) || null : value(field.key) || null }), { access: value('access') || null })
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
        town_hall: listingType === 'account' ? Number(attributes[getAccountFields(value('game')).find((field) => field.type === 'number')?.key]) || null : null,
        builder_hall: listingType === 'account' ? Number(attributes.builder_hall) || null : null,
        exp_level: listingType === 'account' ? Number(attributes.experience_level || attributes.account_level || attributes.trainer_level || attributes.farm_level) || null : null,
        gems: listingType === 'account' ? Number(attributes.gems || attributes.diamonds || attributes.v_bucks || attributes.coins) || null : null,
        heroes_level: listingType === 'account' ? clashHeroSummary(attributes) || attributes.rare_skins || null : null,
        walls_level: listingType === 'account' ? attributes.walls_level || attributes.rank || attributes.highest_rank || null : null,
        full_email_access: listingType === 'account' ? value('access') === 'Full email access' : false,
        instant_delivery: deliveryMethod === 'instant',
        price: Number(value('price')),
        original_price: Number(value('originalPrice')) || null,
        description: value('description') || null,
        status: value('status'),
      },
    });
  }

  return <div className="admin-modal-overlay admin-modal-overlay--edit" onMouseDown={onClose}><form onSubmit={submit} onMouseDown={(event) => event.stopPropagation()} className="admin-modal"><button type="button" onClick={onClose} className="admin-modal-close"><Icon name="close" /></button><p className="admin-eyebrow">Inventory editor</p><h2 className="admin-modal-title">Edit listing</h2><p className="admin-modal-subtitle">Update listing information and manage its complete image gallery.</p>
    {error && <p className="admin-error-box">{error}</p>}
    <div className="admin-gallery-section"><div className="admin-ui-005"><div><p className="admin-field-label">Listing pictures</p><p className="admin-help-text">Use the arrows to set the buyer gallery order. Picture 1 is the cover.</p></div><span className="admin-ui-052">{gallery.length} / {MAX_LISTING_IMAGES}</span></div>{gallery.length > 0 && <div className="admin-gallery-grid">{gallery.map((image, index) => <div key={image.id} className={`admin-gallery-card admin-gallery-card--large${index === 0 ? ' is-cover' : ''}`}><img src={image.preview} alt={`Listing picture ${index + 1}`} className="admin-cover-image" /><span className="admin-gallery-index">{index + 1}</span><div className="admin-gallery-tools"><div className="admin-ui-053"><button type="button" disabled={index === 0} onClick={() => moveImage(index, -1)} className="admin-gallery-arrow" aria-label="Move image left">←</button><button type="button" disabled={index === gallery.length - 1} onClick={() => moveImage(index, 1)} className="admin-gallery-arrow" aria-label="Move image right">→</button></div>{index > 0 && <button type="button" onClick={() => makeCover(index)} className="admin-cover-button">Cover</button>}<button type="button" onClick={() => setGallery((current) => current.filter((item) => item.id !== image.id))} className="admin-gallery-remove" aria-label="Remove image"><Icon name="close" className="admin-icon-xs" /></button></div></div>)}</div>}<label className="admin-add-pictures"><span><span className="admin-ui-007">+ Add more pictures</span><span className="admin-add-pictures-help">JPG, PNG or WebP · up to 12 MB · automatically optimized</span></span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPictures} className="admin-sr-only" /></label></div>
    <div className="admin-type-tabs">{listingTypes.map(([value, label]) => <button key={value} type="button" onClick={() => setListingType(value)} className={`admin-type-tab${listingType === value ? ' is-active' : ''}`}>{label}</button>)}</div>
    <div className="admin-form-grid">
      <EditField label="Game" inputClass={inputClass}><select name="game" value={gameId} onChange={(event) => setGameId(event.target.value)}>{games.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></EditField>
      <EditField label="Status" inputClass={inputClass}><select name="status" defaultValue={account.status || 'available'}><option value="available">Available</option><option value="sold">Sold</option></select></EditField>
      <EditField label="Listing title *" inputClass={inputClass}><input name="title" required defaultValue={account.title || ''} /></EditField>
      <EditField label="Platform" inputClass={inputClass}><select name="platform" defaultValue={account.platform || ''}><option value="">Any platform</option>{platforms.map((value) => <option key={value}>{value}</option>)}</select></EditField>
      <EditField label="Region" inputClass={inputClass}><select name="region" defaultValue={account.region || ''}><option value="">Any region</option>{regions.map((value) => <option key={value}>{value}</option>)}</select></EditField>
      {listingType === 'account' && <><EditField label="Account access" inputClass={inputClass}><select name="access" defaultValue={account.attributes?.access || (account.full_email_access ? 'Full email access' : 'Game login only')}><option>Full email access</option><option>Game login only</option><option>Transfer assistance</option></select></EditField>{getAccountFields(gameId).map((field) => <EditField key={`${gameId}-${field.key}`} label={`${field.label}${field.required ? ' *' : ''}`} inputClass={inputClass}><input name={field.key} type={field.type} min={field.type === 'number' ? 0 : undefined} required={field.required} defaultValue={accountFieldValue(account, field.key)} placeholder={field.placeholder} /></EditField>)}</>}
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
    <label className="admin-description-field"><span className="admin-edit-label">Description</span><textarea name="description" rows="4" defaultValue={account.description || ''} className={`${inputClass} admin-no-resize`} /></label>
    <div className="admin-form-actions"><button type="button" onClick={onClose} className="admin-button-secondary">Cancel</button><button disabled={saving} className="admin-button-primary">{saving ? 'Saving…' : 'Save changes'}</button></div>
  </form></div>;
}

function EditField({ label, inputClass, children }) {
  return <label><span className="admin-edit-label">{label}</span>{cloneElement(children, { className: inputClass })}</label>;
}

function StatusBadge({ status = 'pending' }) {
  const tone = status === 'available' || status === 'delivered' || status === 'completed'
    ? 'success'
    : status === 'paid'
      ? 'paid'
      : status === 'sold'
        ? 'sold'
        : 'pending';
  return <span className={`admin-status-badge admin-status-badge--${tone}`}>{status}</span>;
}

function EmptyState({ icon, title, text }) {
  return <div className="admin-empty-state"><span className="admin-empty-icon"><Icon name={icon} /></span><h3 className="admin-empty-title">{title}</h3><p className="admin-modal-subtitle">{text}</p></div>;
}

function AdminTableLoading({ loading }) {
  if (!loading) return null;
  return <div className="admin-loading-list">{[1, 2, 3, 4].map((item) => <div key={item} className="admin-loading-row" />)}</div>;
}

function AdminField({ label, children, className = '' }) {
  const isImageUpload = label === 'Image URL';
  if (isImageUpload) return <ImageUploadInput className={className} />;
  const field = cloneElement(children, {
    className: `admin-form-control${children.type === 'textarea' ? ' admin-no-resize' : ''}`,
  });
  return <label className={`admin-field ${className}`}><span className="admin-field-label-block">{label}</span>{field}</label>;
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

  return <div className={`admin-image-upload ${className}`}>
    <label className="admin-block"><span className="admin-field-label-block">Listing images *</span><span className="admin-upload-dropzone"><span className="admin-upload-icon"><Icon name="plus" /></span><span className="admin-upload-title">Choose high-quality images</span><span className="admin-upload-help">Up to {MAX_LISTING_IMAGES} JPG, PNG, or WebP files · 12 MB each</span><span className="admin-upload-success">Automatically compressed to sharp WebP with fast thumbnails</span><input ref={inputRef} name="image" type="file" accept="image/jpeg,image/png,image/webp" multiple required onChange={previewImages} className="admin-sr-only" /></span></label>
    {error && <p className="admin-upload-error">{error}</p>}
    {previews.length > 0 && <div className="admin-ui-054"><div className="admin-gallery-header"><span className="admin-gallery-label">Gallery order · first picture is the cover</span><span className="admin-ui-052">{previews.length} / {MAX_LISTING_IMAGES}</span></div><div className="admin-preview-grid">{previews.map((preview, index) => <div key={preview.id} className={`admin-gallery-card${index === 0 ? ' is-cover' : ''}`}><img src={preview.url} alt={`Selected picture ${index + 1}`} className="admin-cover-image" /><span className="admin-preview-index">{index + 1}</span><div className="admin-preview-tools"><div className="admin-ui-053"><button type="button" disabled={index === 0} onClick={() => movePreview(index, -1)} className="admin-gallery-arrow" aria-label="Move image left">←</button><button type="button" disabled={index === previews.length - 1} onClick={() => movePreview(index, 1)} className="admin-gallery-arrow" aria-label="Move image right">→</button></div><button type="button" onClick={() => removePreview(index)} className="admin-gallery-remove" aria-label="Remove image"><Icon name="close" className="admin-icon-xs" /></button></div></div>)}</div></div>}
  </div>;
}
