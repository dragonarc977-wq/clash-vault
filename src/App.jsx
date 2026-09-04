import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// ===== INLINE SVG ICONS (no packages needed) =====
const IconPackage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
  </svg>
);

const IconTrending = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);

const IconDollar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
  </svg>
);

const IconEmptyBox = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.3}}>
    <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
  </svg>
);

const IconEmptyDoc = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.3}}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

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

  const fetchData = async () => {
    setLoading(true);
    const [{ data: accs }, { data: ords }] = await Promise.all([
      supabase.from('accounts').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*, accounts(town_hall)').order('created_at', { ascending: false })
    ]);
    setAccounts(accs || []);
    setOrders(ords || []);
    setLoading(false);
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
      acc.heroes_level?.toLowerCase().includes(q) ||
      acc.status?.toLowerCase().includes(q)
    );
  });

  const addAccount = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newAccount = {
      town_hall: parseInt(form.th.value),
      builder_hall: parseInt(form.bh.value) || null,
      exp_level: parseInt(form.level.value) || null,
      gems: parseInt(form.gems.value) || null,
      heroes_level: form.heroes.value || null,
      walls_level: form.walls.value || null,
      price: parseInt(form.price.value),
      original_price: parseInt(form.originalPrice.value) || null,
      image_url: form.image.value || null,
      description: form.description.value || null,
      status: 'available'
    };
    
    const { error } = await supabase.from('accounts').insert(newAccount);
    if (error) {
      alert('Error: ' + error.message);
      return;
    }
    setShowAddModal(false);
    fetchData();
    form.reset();
  };

  const deleteAccount = async (id) => {
    if (!confirm('Are you sure you want to delete this account? This cannot be undone.')) return;
    await supabase.from('accounts').delete().eq('id', id);
    fetchData();
  };

  const markDelivered = async (orderId) => {
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    fetchData();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  };

  return (
    <div className="admin-page">
      <style>{`
        .admin-page {
          padding-top: 90px;
          min-height: 100vh;
          background: #0a0a0f;
          color: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
        }
        
        /* Header */
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .admin-title {
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 6px 0;
          color: #ffffff;
        }
        .admin-subtitle {
          color: #6b6b7b;
          margin: 0;
          font-size: 14px;
        }
        .btn-gold {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #ffd700, #e6c200);
          color: #0a0a0f;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: #14141e;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          border-color: rgba(255,215,0,0.1);
          transform: translateY(-2px);
        }
        .stat-card.blue { border-top: 3px solid #3b82f6; }
        .stat-card.green { border-top: 3px solid #22c55e; }
        .stat-card.gold { border-top: 3px solid #ffd700; }
        .stat-card.purple { border-top: 3px solid #a855f7; }
        
        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .stat-label {
          font-size: 13px;
          color: #6b6b7b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon.blue { background: rgba(59,130,246,0.1); color: #60a5fa; }
        .stat-icon.green { background: rgba(34,197,94,0.1); color: #22c55e; }
        .stat-icon.gold { background: rgba(255,215,0,0.1); color: #ffd700; }
        .stat-icon.purple { background: rgba(168,85,247,0.1); color: #a855f7; }
        
        .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 4px;
        }
        .stat-value.gold { color: #ffd700; }
        .stat-footer {
          font-size: 13px;
          color: #6b6b7b;
        }
        
        /* Tabs */
        .admin-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 16px;
          flex-wrap: wrap;
        }
        .admin-tab {
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #6b6b7b;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .admin-tab:hover {
          color: #a0a0b0;
        }
        .admin-tab.active {
          background: rgba(255,215,0,0.08);
          color: #ffd700;
        }
        
        /* Search */
        .admin-search {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          max-width: 320px;
        }
        .admin-search input {
          flex: 1;
          padding: 10px 14px 10px 38px;
          background: #14141e;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          position: relative;
        }
        .admin-search input:focus {
          border-color: rgba(255,215,0,0.4);
        }
        .search-icon-wrap {
          position: relative;
          width: 100%;
        }
        .search-icon-wrap svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b6b7b;
          pointer-events: none;
        }
        
        /* Table Card */
        .table-card {
          background: #14141e;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          overflow: hidden;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th {
          text-align: left;
          padding: 16px;
          color: #6b6b7b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          white-space: nowrap;
        }
        .data-table td {
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          font-size: 14px;
          vertical-align: middle;
          color: #ffffff;
        }
        .data-table tr {
          transition: background 0.2s;
        }
        .data-table tbody tr:hover td {
          background: rgba(255,255,255,0.02);
        }
        .data-table tbody tr:last-child td {
          border-bottom: none;
        }
        
        /* Account cell */
        .account-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .account-thumb {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #1a1a24;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }
        .account-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .account-name {
          font-weight: 700;
          color: #ffd700;
          font-size: 14px;
        }
        .account-meta {
          font-size: 12px;
          color: #6b6b7b;
          margin-top: 2px;
        }
        
        /* Price */
        .price-current {
          font-weight: 700;
          color: #ffffff;
        }
        .price-original {
          font-size: 12px;
          color: #6b6b7b;
          text-decoration: line-through;
          margin-top: 2px;
        }
        
        /* Badges */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
          text-transform: capitalize;
          white-space: nowrap;
        }
        .badge-success {
          background: rgba(34,197,94,0.1);
          color: #22c55e;
          border-color: rgba(34,197,94,0.3);
        }
        .badge-gold {
          background: rgba(255,215,0,0.1);
          color: #ffd700;
          border-color: rgba(255,215,0,0.3);
        }
        .badge-blue {
          background: rgba(59,130,246,0.1);
          color: #60a5fa;
          border-color: rgba(59,130,246,0.3);
        }
        
        /* Actions */
        .action-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
        }
        .action-btn:hover {
          background: rgba(239,68,68,0.1);
        }
        .deliver-btn {
          padding: 6px 14px;
          background: rgba(59,130,246,0.1);
          color: #60a5fa;
          border: 1px solid rgba(59,130,246,0.3);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .deliver-btn:hover {
          background: rgba(59,130,246,0.2);
        }
        
        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b6b7b;
        }
        .empty-state h3 {
          color: #ffffff;
          margin: 16px 0 8px;
          font-size: 18px;
        }
        .empty-state p {
          margin: 0;
          font-size: 14px;
        }
        
        /* Shimmer loading */
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #1a1a24 25%, #252535 50%, #1a1a24 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
          border-radius: 4px;
        }
        .shimmer-row {
          display: flex;
          gap: 20px;
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          align-items: center;
        }
        
        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          backdrop-filter: blur(10px);
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal {
          background: #14141e;
          border: 1px solid rgba(255,215,0,0.2);
          border-radius: 20px;
          padding: 32px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 0 60px rgba(255,215,0,0.05);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          color: #ffffff;
        }
        .close-btn {
          background: none;
          border: none;
          color: #6b6b7b;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }
        .close-btn:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.05);
        }
        
        /* Form */
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-group {
          margin-bottom: 18px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #a0a0b0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 11px 14px;
          background: #0a0a0f;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          border-color: rgba(255,215,0,0.4);
          box-shadow: 0 0 0 3px rgba(255,215,0,0.05);
        }
        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #3a3a4a;
        }
        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }
        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .btn-secondary {
          flex: 1;
          padding: 14px;
          background: transparent;
          color: #ffd700;
          font-weight: 600;
          border: 1px solid rgba(255,215,0,0.25);
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          background: rgba(255,215,0,0.08);
          border-color: rgba(255,215,0,0.5);
        }
        
        /* Scrollbar for modal */
        .modal::-webkit-scrollbar {
          width: 6px;
        }
        .modal::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal::-webkit-scrollbar-thumb {
          background: #2a2a3a;
          border-radius: 3px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: stretch;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .data-table {
            min-width: 700px;
          }
          .table-wrap {
            overflow-x: auto;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .admin-container {
            padding: 20px 16px;
          }
          .modal {
            padding: 24px 20px;
          }
        }
      `}</style>

      <div className="admin-container">
        
        {/* ===== HEADER ===== */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Seller Dashboard</h1>
            <p className="admin-subtitle">Manage inventory, track orders, and monitor revenue</p>
          </div>
          <button className="btn-gold" onClick={() => setShowAddModal(true)}>
            <IconPlus />
            <span>Add Account</span>
          </button>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-header">
              <span className="stat-label">Total Accounts</span>
              <div className="stat-icon blue"><IconPackage /></div>
            </div>
            <div className="stat-value">{accounts.length}</div>
            <div className="stat-footer">{totalStock} in stock</div>
          </div>

          <div className="stat-card green">
            <div className="stat-header">
              <span className="stat-label">Sold</span>
              <div className="stat-icon green"><IconTrending /></div>
            </div>
            <div className="stat-value">{totalSold}</div>
            <div className="stat-footer">Lifetime sales</div>
          </div>

          <div className="stat-card gold">
            <div className="stat-header">
              <span className="stat-label">Revenue</span>
              <div className="stat-icon gold"><IconDollar /></div>
            </div>
            <div className="stat-value gold">{formatCurrency(totalRevenue)}</div>
            <div className="stat-footer">Total earnings</div>
          </div>

          <div className="stat-card purple">
            <div className="stat-header">
              <span className="stat-label">Orders</span>
              <div className="stat-icon purple"><IconUsers /></div>
            </div>
            <div className="stat-value">{orders.length}</div>
            <div className="stat-footer">All time</div>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'accounts' ? 'active' : ''}`} 
            onClick={() => setActiveTab('accounts')}
          >
            Inventory ({accounts.length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} 
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
        </div>

        {/* ===== INVENTORY TAB ===== */}
        {activeTab === 'accounts' && (
          <>
            <div className="admin-search">
              <div className="search-icon-wrap">
                <IconSearch />
                <input 
                  type="text" 
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="table-card">
              {loading ? (
                <div>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="shimmer-row">
                      <div className="shimmer" style={{width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0}} />
                      <div className="shimmer" style={{width: '140px', height: '16px'}} />
                      <div className="shimmer" style={{width: '80px', height: '16px', marginLeft: 'auto'}} />
                      <div className="shimmer" style={{width: '80px', height: '16px'}} />
                      <div className="shimmer" style={{width: '100px', height: '16px'}} />
                    </div>
                  ))}
                </div>
              ) : filteredAccounts.length === 0 ? (
                <div className="empty-state">
                  <IconEmptyBox />
                  <h3>No accounts found</h3>
                  <p>{searchQuery ? 'Try a different search term' : 'Add your first account to start selling'}</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Added</th>
                        <th style={{textAlign: 'right'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccounts.map(acc => (
                        <tr key={acc.id}>
                          <td>
                            <div className="account-cell">
                              <div className="account-thumb">
                                {acc.image_url ? (
                                  <img src={acc.image_url} alt="" />
                                ) : (
                                  <span style={{fontSize: '20px'}}>🏰</span>
                                )}
                              </div>
                              <div>
                                <div className="account-name">TH{acc.town_hall} Account</div>
                                <div className="account-meta">
                                  {acc.heroes_level ? `Heroes ${acc.heroes_level}` : 'Maxed'} • {acc.gems ? `${acc.gems} Gems` : 'High Gems'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="price-current">{formatCurrency(acc.price)}</div>
                            {acc.original_price > 0 && (
                              <div className="price-original">{formatCurrency(acc.original_price)}</div>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${acc.status === 'available' ? 'badge-success' : 'badge-gold'}`}>
                              {acc.status === 'available' ? <IconCheck /> : <IconShield />}
                              {acc.status}
                            </span>
                          </td>
                          <td style={{color: '#6b6b7b', fontSize: '13px', whiteSpace: 'nowrap'}}>
                            {formatDate(acc.created_at)}
                          </td>
                          <td style={{textAlign: 'right'}}>
                            <button 
                              className="action-btn" 
                              onClick={() => deleteAccount(acc.id)}
                              title="Delete account"
                            >
                              <IconTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ===== ORDERS TAB ===== */}
        {activeTab === 'orders' && (
          <div className="table-card">
            {loading ? (
              <div>
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="shimmer-row">
                    <div className="shimmer" style={{width: '80px', height: '16px'}} />
                    <div className="shimmer" style={{width: '60px', height: '16px'}} />
                    <div className="shimmer" style={{width: '80px', height: '16px', marginLeft: 'auto'}} />
                    <div className="shimmer" style={{width: '80px', height: '16px'}} />
                    <div className="shimmer" style={{width: '100px', height: '16px'}} />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <IconEmptyDoc />
                <h3>No orders yet</h3>
                <p>Orders will appear here when customers buy</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Account</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th style={{textAlign: 'right'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td style={{fontFamily: 'monospace', fontSize: '12px', color: '#6b6b7b', whiteSpace: 'nowrap'}}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td>
                          <span style={{fontWeight: 700, color: '#ffd700'}}>TH{order.accounts?.town_hall || '?'}</span>
                        </td>
                        <td style={{fontWeight: 700}}>
                          {formatCurrency(order.amount)}
                        </td>
                        <td>
                          <span className={`badge ${
                            order.status === 'paid' ? 'badge-success' : 
                            order.status === 'delivered' ? 'badge-blue' : 'badge-gold'
                          }`}>
                            {order.status === 'paid' && <IconCheck />}
                            {order.status === 'delivered' && <IconShield />}
                            {order.status}
                          </span>
                        </td>
                        <td style={{color: '#6b6b7b', fontSize: '13px', whiteSpace: 'nowrap'}}>
                          {formatDate(order.created_at)}
                        </td>
                        <td style={{textAlign: 'right'}}>
                          {order.status === 'paid' && (
                            <button 
                              className="deliver-btn"
                              onClick={() => markDelivered(order.id)}
                            >
                              Mark Delivered
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== ADD ACCOUNT MODAL ===== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Account</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <IconX />
              </button>
            </div>

            <form onSubmit={addAccount}>
              <div className="form-row">
                <div className="form-group">
                  <label>Town Hall *</label>
                  <input name="th" type="number" min="1" max="20" required placeholder="17" />
                </div>
                <div className="form-group">
                  <label>Builder Hall</label>
                  <input name="bh" type="number" min="1" max="10" placeholder="10" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Exp Level</label>
                  <input name="level" type="number" placeholder="300" />
                </div>
                <div className="form-group">
                  <label>Gems</label>
                  <input name="gems" type="number" placeholder="5000" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input name="price" type="number" min="1" required placeholder="2999" />
                </div>
                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input name="originalPrice" type="number" placeholder="4999" />
                </div>
              </div>

              <div className="form-group">
                <label>Heroes Level</label>
                <input name="heroes" placeholder="90/90/60/35" />
              </div>

              <div className="form-group">
                <label>Walls Level</label>
                <input name="walls" placeholder="16" />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input name="image" type="url" placeholder="https://..." />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows="3" placeholder="Account details, special features, etc."></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-gold" style={{flex: 1, justifyContent: 'center'}}>
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}