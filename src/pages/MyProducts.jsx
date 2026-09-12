import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { MAX_LISTING_IMAGES, optimizeListingImage, validateListingFiles } from '../lib/imageProcessing';
import { accountFieldValue, gameLabel, getAccountFields, itemCategories, listingTypes, marketplaceGames, platforms, regions, serviceCategories } from '../lib/listingOptions';

const inputClass = 'mt-2 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-100';
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const storagePath = (url) => url?.includes('/account-images/') ? decodeURIComponent(url.split('/account-images/')[1]) : null;

async function uploadImage(file, userId, gameId) {
  const { full, thumbnail } = await optimizeListingImage(file);
  const key = crypto.randomUUID();
  const fullPath = `${userId}/${gameId}/${key}.webp`;
  const thumbnailPath = `${userId}/${gameId}/thumbnails/${key}.webp`;
  const bucket = supabase.storage.from('account-images');
  const { error: fullError } = await bucket.upload(fullPath, full, { cacheControl: '31536000', contentType: 'image/webp' });
  if (fullError) throw fullError;
  const { error: thumbnailError } = await bucket.upload(thumbnailPath, thumbnail, { cacheControl: '31536000', contentType: 'image/webp' });
  if (thumbnailError) { await bucket.remove([fullPath]); throw thumbnailError; }
  return { paths: [fullPath, thumbnailPath], url: bucket.getPublicUrl(fullPath).data.publicUrl, thumbnail: bucket.getPublicUrl(thumbnailPath).data.publicUrl };
}

export default function MyProducts() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState(null);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async (userId) => {
    const [{ data: seller }, { data: inventory, error }] = await Promise.all([
      supabase.from('seller_profiles').select('status').eq('user_id', userId).maybeSingle(),
      supabase.from('accounts').select('*').eq('seller_id', userId).order('created_at', { ascending: false }),
    ]);
    if (!seller || seller.status !== 'approved') { navigate('/become-a-seller', { replace: true }); return; }
    if (error) setNotice(error.message);
    setProducts(inventory || []);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (!session?.user) { navigate('/login', { replace: true }); return; }
      setUser(session.user);
      load(session.user.id);
    });
    return () => { active = false; };
  }, [load, navigate]);

  const visibleProducts = useMemo(() => products.filter((product) => {
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || [product.title, product.game_id, product.listing_type, ...Object.values(product.attributes || {})].some((value) => String(value || '').toLowerCase().includes(search));
    return matchesQuery && (typeFilter === 'all' || (product.listing_type || 'account') === typeFilter) && (statusFilter === 'all' || (statusFilter === 'review' ? product.moderation_status === 'pending' : product.status === statusFilter));
  }), [products, query, statusFilter, typeFilter]);

  async function saveProduct(event, listingType, gameId, product) {
    event.preventDefault();
    const form = event.currentTarget;
    const files = Array.from(form.images.files || []);
    const existingUrls = product?.image_urls?.length ? product.image_urls : [product?.image_url].filter(Boolean);
    const existingThumbnails = product?.thumbnail_urls?.length ? product.thumbnail_urls : [product?.thumbnail_url].filter(Boolean);
    const validation = validateListingFiles(files, existingUrls.length);
    if ((!product && !files.length) || validation) { setNotice(validation || 'Choose at least one product image.'); return; }
    setSaving(true); setNotice('');
    const uploadedPaths = [], urls = [...existingUrls], thumbnails = [...existingThumbnails];
    try {
      for (const file of files) {
        const image = await uploadImage(file, user.id, gameId);
        uploadedPaths.push(...image.paths); urls.push(image.url); thumbnails.push(image.thumbnail);
      }
      const value = (name) => form.elements.namedItem(name)?.value?.trim() || '';
      let attributes;
      if (listingType === 'account') {
        attributes = { access: value('access') };
        getAccountFields(gameId).forEach((field) => { const raw = value(field.key); attributes[field.key] = field.type === 'number' ? Number(raw) || null : raw || null; });
      } else if (listingType === 'item') {
        attributes = { item_name: value('itemName'), item_category: value('itemCategory'), quantity: Number(value('quantity')) || 1 };
      } else {
        attributes = { service_name: value('serviceName'), service_category: value('serviceCategory'), estimated_days: Number(value('estimatedDays')) || 1, requirements: value('requirements') || null };
      }
      const deliveryMethod = listingType === 'service' ? 'scheduled' : value('deliveryMethod');
      const primaryAccountField = listingType === 'account' ? getAccountFields(gameId).find((field) => field.type === 'number') : null;
      const payload = {
        seller_id: user.id, game_id: gameId, title: value('title'), listing_type: listingType,
        delivery_method: deliveryMethod, platform: value('platform'), region: value('region'), attributes,
        town_hall: primaryAccountField ? Number(attributes[primaryAccountField.key]) || null : null,
        builder_hall: listingType === 'account' ? Number(attributes.builder_hall) || null : null,
        exp_level: listingType === 'account' ? Number(attributes.experience_level || attributes.account_level || attributes.trainer_level || attributes.farm_level) || null : null,
        gems: listingType === 'account' ? Number(attributes.gems || attributes.diamonds || attributes.v_bucks || attributes.coins) || null : null,
        heroes_level: listingType === 'account' ? attributes.heroes_level || attributes.rare_skins || null : null,
        walls_level: listingType === 'account' ? attributes.walls_level || attributes.rank || attributes.highest_rank || null : null,
        full_email_access: listingType === 'account' && value('access') === 'Full email access', instant_delivery: deliveryMethod === 'instant',
        price: Number(value('price')), original_price: Number(value('originalPrice')) || null, description: value('description') || null,
        image_url: urls[0], image_urls: urls, thumbnail_url: thumbnails[0] || urls[0], thumbnail_urls: thumbnails.length ? thumbnails : urls,
        status: product?.status || 'available', moderation_status: 'pending',
      };
      const operation = product ? supabase.from('accounts').update(payload).eq('id', product.id).eq('seller_id', user.id).select().single() : supabase.from('accounts').insert(payload).select().single();
      const { error } = await operation;
      if (error) throw error;
      setEditor(null);
      setNotice(product ? 'Product updated and sent for approval again.' : 'Product created and sent for approval.');
      await load(user.id);
    } catch (error) {
      if (uploadedPaths.length) await supabase.storage.from('account-images').remove(uploadedPaths);
      setNotice(error.message || 'Could not save this product.');
    } finally { setSaving(false); }
  }

  async function deleteProduct(product) {
    if (product.status === 'sold' || !window.confirm(`Delete “${product.title || 'this product'}”? This cannot be undone.`)) return;
    setSaving(true); setNotice('');
    const { error } = await supabase.from('accounts').delete().eq('id', product.id).eq('seller_id', user.id);
    if (error) setNotice(error.message);
    else {
      const urls = [...(product.image_urls || []), ...(product.thumbnail_urls || []), product.image_url, product.thumbnail_url].filter(Boolean);
      const paths = [...new Set(urls.map(storagePath).filter(Boolean))];
      if (paths.length) await supabase.storage.from('account-images').remove(paths);
      setNotice('Product deleted.');
      await load(user.id);
    }
    setSaving(false);
  }

  if (loading) return <main className="min-h-screen bg-zinc-50 px-5 pt-28"><div className="mx-auto h-96 max-w-7xl animate-pulse rounded-3xl bg-white" /></main>;

  return <main className="min-h-screen bg-zinc-50 px-5 pb-20 pt-24 text-zinc-950 sm:px-8"><div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a87300]">Verified seller inventory</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em] sm:text-5xl">My products</h1><p className="mt-3 text-sm text-zinc-500">Create and manage your accounts, items and services.</p></div><div className="flex gap-2"><button onClick={() => navigate('/seller')} className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-bold">Seller dashboard</button><button onClick={() => setEditor({ mode: 'create' })} className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white">+ Create product</button></div></div>
    {notice && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">{notice}</div>}
    <section className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-zinc-100 p-5 lg:flex-row lg:items-center lg:justify-between sm:p-6"><div><h2 className="text-xl font-black">Your inventory</h2><p className="mt-1 text-sm text-zinc-500">{visibleProducts.length} of {products.length} products</p></div><div className="grid gap-2 sm:grid-cols-3"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none" /><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-11 rounded-xl border border-zinc-200 px-3 text-sm font-bold"><option value="all">All types</option>{listingTypes.map(([id, label]) => <option key={id} value={id}>{label}s</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-zinc-200 px-3 text-sm font-bold"><option value="all">All status</option><option value="available">Available</option><option value="sold">Sold</option><option value="review">Under review</option></select></div></div>
      {visibleProducts.length ? <div className="divide-y divide-zinc-100">{visibleProducts.map((product) => <article key={product.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"><div className="flex min-w-0 gap-4"><img src={product.thumbnail_url || product.image_url} alt="" className="h-20 w-20 shrink-0 rounded-2xl bg-zinc-100 object-cover" /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-lg font-black">{product.title || `${gameLabel(product.game_id)} product`}</h3><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[9px] font-black uppercase text-zinc-500">{product.listing_type || 'account'}</span></div><p className="mt-1 text-sm text-zinc-500">{gameLabel(product.game_id)} · {money(product.price)}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${product.status === 'sold' ? 'bg-violet-50 text-violet-700' : product.moderation_status === 'approved' ? 'bg-emerald-50 text-emerald-700' : product.moderation_status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{product.status === 'sold' ? 'Sold' : product.moderation_status}</span></div></div><div className="flex gap-2"><button disabled={product.status === 'sold'} onClick={() => setEditor({ mode: 'edit', product })} className="rounded-full border border-zinc-200 px-5 py-2.5 text-xs font-black disabled:cursor-not-allowed disabled:opacity-40">Edit</button><button disabled={saving || product.status === 'sold'} onClick={() => deleteProduct(product)} className="rounded-full border border-red-200 px-5 py-2.5 text-xs font-black text-red-600 disabled:opacity-40">Delete</button></div></article>)}</div> : <div className="px-6 py-20 text-center"><p className="text-xl font-black">No products found</p><p className="mt-2 text-sm text-zinc-500">Create your first product or change the filters.</p></div>}
    </section>
    {editor && <ProductEditor key={editor.product?.id || 'new'} product={editor.product} saving={saving} onClose={() => setEditor(null)} onSave={saveProduct} />}
  </div></main>;
}

function ProductEditor({ product, saving, onClose, onSave }) {
  const [listingType, setListingType] = useState(product?.listing_type || 'account');
  const [gameId, setGameId] = useState(product?.game_id || 'clash-of-clans');
  const attributes = product?.attributes || {};
  return <div className="fixed inset-0 z-[4000] overflow-y-auto bg-zinc-950/60 p-4 backdrop-blur-sm" onMouseDown={onClose}><form onSubmit={(event) => onSave(event, listingType, gameId, product)} onMouseDown={(event) => event.stopPropagation()} className="mx-auto my-8 max-w-3xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
    <div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-wider text-[#a87300]">Verified seller</p><h2 className="mt-2 text-2xl font-black">{product ? 'Edit product' : 'Create product'}</h2><p className="mt-2 text-sm text-zinc-500">Game-specific fields help buyers compare listings accurately.</p></div><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200">×</button></div>
    <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-zinc-100 p-1.5">{listingTypes.map(([id, label]) => <button key={id} type="button" onClick={() => setListingType(id)} className={`rounded-xl px-2 py-3 text-sm font-black ${listingType === id ? 'bg-zinc-950 text-white' : 'text-zinc-500'}`}>{label}</button>)}</div>
    <div className="mt-7 grid gap-5 sm:grid-cols-2">
      <Field label="Game *"><select name="game" value={gameId} onChange={(event) => setGameId(event.target.value)} className={inputClass}>{marketplaceGames.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></Field>
      <Field label="Listing title *"><input name="title" required maxLength="100" defaultValue={product?.title || ''} placeholder="Clear product title" className={inputClass} /></Field>
      <Field label="Platform *"><select name="platform" required defaultValue={product?.platform || 'Any platform'} className={inputClass}>{platforms.map((value) => <option key={value}>{value}</option>)}</select></Field>
      <Field label="Region *"><select name="region" required defaultValue={product?.region || 'Global'} className={inputClass}>{regions.map((value) => <option key={value}>{value}</option>)}</select></Field>
      {listingType === 'account' && <><Field label="Account access *"><select name="access" required defaultValue={attributes.access || (product?.full_email_access ? 'Full email access' : 'Game login only')} className={inputClass}><option>Full email access</option><option>Game login only</option><option>Transfer assistance</option></select></Field>{getAccountFields(gameId).map((field) => <Field key={`${gameId}-${field.key}`} label={`${field.label}${field.required ? ' *' : ''}`}><input name={field.key} type={field.type} min={field.type === 'number' ? 0 : undefined} required={field.required} defaultValue={accountFieldValue(product, field.key)} placeholder={field.placeholder} className={inputClass} /></Field>)}</>}
      {listingType === 'item' && <><Field label="Item name *"><input name="itemName" required defaultValue={attributes.item_name || ''} className={inputClass} /></Field><Field label="Item category *"><select name="itemCategory" required defaultValue={attributes.item_category || 'Currency'} className={inputClass}>{itemCategories.map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Quantity *"><input name="quantity" type="number" min="1" required defaultValue={attributes.quantity || 1} className={inputClass} /></Field></>}
      {listingType === 'service' && <><Field label="Service name *"><input name="serviceName" required defaultValue={attributes.service_name || ''} className={inputClass} /></Field><Field label="Service category *"><select name="serviceCategory" required defaultValue={attributes.service_category || 'Rank boost'} className={inputClass}>{serviceCategories.map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="Estimated completion (days) *"><input name="estimatedDays" type="number" min="1" max="90" required defaultValue={attributes.estimated_days || 1} className={inputClass} /></Field><Field label="Buyer requirements"><input name="requirements" defaultValue={attributes.requirements || ''} className={inputClass} /></Field></>}
      {listingType !== 'service' && <Field label="Delivery method *"><select name="deliveryMethod" required defaultValue={product?.delivery_method || 'seller_delivery'} className={inputClass}><option value="seller_delivery">Seller delivery</option><option value="instant">Instant code/details</option></select></Field>}
      {listingType === 'service' && <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs font-semibold leading-5 text-blue-800">Scheduled delivery is used for services.</div>}
      <Field label="Price (₹) *"><input name="price" type="number" min="1" required defaultValue={product?.price || ''} className={inputClass} /></Field>
      <Field label="Original price (₹)"><input name="originalPrice" type="number" min="1" defaultValue={product?.original_price || ''} className={inputClass} /></Field>
      <Field label={product ? 'Add more pictures' : 'Product pictures *'}><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required={!product} className="mt-2 block w-full text-xs file:mr-3 file:rounded-xl file:border-0 file:bg-zinc-950 file:px-4 file:py-3 file:font-bold file:text-white" /></Field>
    </div>
    <Field label="Description *" className="mt-5"><textarea name="description" rows="4" required defaultValue={product?.description || ''} className={`${inputClass} h-auto py-3`} /></Field><p className="mt-3 text-xs text-zinc-400">Up to {MAX_LISTING_IMAGES} pictures total. Edits return to admin review before becoming visible.</p>
    <button disabled={saving} className="mt-6 w-full rounded-2xl bg-zinc-950 px-6 py-4 text-sm font-black text-white disabled:opacity-50">{saving ? 'Saving…' : product ? 'Save and submit for review' : 'Create and submit for review'}</button>
  </form></div>;
}

function Field({ label, children, className = '' }) { return <label className={`block text-xs font-bold text-zinc-700 ${className}`}>{label}{children}</label>; }
