import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// ===== MAIN COMPONENT =====
export default function Admin() {
  const [accounts, setAccounts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('accounts');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const safeInt = (val) => (val ? parseInt(val) : null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [accRes, ordRes] = await Promise.all([
        supabase.from('accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*, accounts(town_hall)').order('created_at', { ascending: false })
      ]);

      if (accRes.error) throw accRes.error;
      if (ordRes.error) throw ordRes.error;

      setAccounts(accRes.data || []);
      setOrders(ordRes.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders
    .filter(o => o.status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const totalSold = accounts.filter(a => a.status === 'sold').length;
  const totalStock = accounts.filter(a => a.status === 'available').length;

  const filteredAccounts = accounts.filter(acc => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    return (
      acc.town_hall?.toString().includes(q) ||
      acc.price?.toString().includes(q) ||
      acc.heroes_level?.toLowerCase()?.includes(q) ||
      acc.status?.toLowerCase()?.includes(q)
    );
  });

  const addAccount = async (e) => {
    e.preventDefault();
    const form = e.target;

    const newAccount = {
      town_hall: safeInt(form.th.value),
      builder_hall: safeInt(form.bh.value),
      exp_level: safeInt(form.level.value),
      gems: safeInt(form.gems.value),
      heroes_level: form.heroes.value || null,
      walls_level: form.walls.value || null,
      price: safeInt(form.price.value),
      original_price: safeInt(form.originalPrice.value),
      image_url: form.image.value || null,
      description: form.description.value || null,
      status: 'available'
    };

    try {
      const { error } = await supabase.from('accounts').insert(newAccount);
      if (error) throw error;

      form.reset();
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteAccount = async (id) => {
    if (!confirm('Delete this account?')) return;

    await supabase.from('accounts').delete().eq('id', id);
    fetchData();
  };

  const markDelivered = async (id) => {
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', id);
    fetchData();
  };

  const formatCurrency = (amt) => '₹' + (amt || 0).toLocaleString('en-IN');
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN') : '-';

  return (
    <div style={{ padding: 20, color: 'white' }}>
      <h1>Admin Panel</h1>

      {/* Tabs */}
      <button onClick={() => setActiveTab('accounts')}>Accounts</button>
      <button onClick={() => setActiveTab('orders')}>Orders</button>

      <button onClick={() => setShowAddModal(true)}>+ Add</button>

      {/* Accounts */}
      {activeTab === 'accounts' && (
        <>
          <input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <p>Loading...</p>
          ) : (
            filteredAccounts.map(acc => (
              <div key={acc.id}>
                TH{acc.town_hall} - {formatCurrency(acc.price)}
                <button onClick={() => deleteAccount(acc.id)}>Delete</button>
              </div>
            ))
          )}
        </>
      )}

      {/* Orders */}
      {activeTab === 'orders' && (
        <>
          {orders.map(o => (
            <div key={o.id}>
              #{o.id.slice(0, 6)} - {formatCurrency(o.amount)} - {o.status}
              {o.status === 'paid' && (
                <button onClick={() => markDelivered(o.id)}>
                  Deliver
                </button>
              )}
            </div>
          ))}
        </>
      )}

      {/* Modal */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          style={{ position: 'fixed', inset: 0, background: '#0008' }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={addAccount}
            style={{ background: '#111', padding: 20, margin: 50 }}
          >
            <input name="th" placeholder="Town Hall" required />
            <input name="price" placeholder="Price" required />
            <input name="heroes" placeholder="Heroes" />
            <input name="image" placeholder="Image URL" />

            <button type="submit">Save</button>
            <button type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}