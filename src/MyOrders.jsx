import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from './lib/supabase';

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('orders')
          .select('*, accounts(*)')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        if (!error) setOrders(data);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const styles = {
    page: { paddingTop: '80px', minHeight: '100vh', backgroundColor: '#0a0a0f', color: '#ffffff', fontFamily: 'sans-serif', paddingBottom: '60px' },
    header: { maxWidth: '800px', margin: '0 auto', padding: '40px 20px 20px', textAlign: 'center' },
    title: { fontSize: '42px', fontWeight: '900', margin: '0 0 8px 0', color: '#ffd700', textTransform: 'uppercase', letterSpacing: '2px' },
    subtitle: { fontSize: '16px', color: '#a0a0b0', margin: '0 0 30px 0' },
    container: { maxWidth: '800px', margin: '0 auto', padding: '0 20px' },

    // Empty State
    emptyState: { textAlign: 'center', padding: '60px 20px', backgroundColor: '#14141e', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '20px' },
    emptyIcon: { fontSize: '60px', marginBottom: '15px' },
    emptyTitle: { fontSize: '24px', fontWeight: '800', margin: '0 0 10px 0', color: '#ffffff' },
    emptyText: { fontSize: '15px', color: '#a0a0b0', margin: '0 0 30px 0', lineHeight: '1.6' },
    browseBtn: { display: 'inline-block', padding: '14px 30px', backgroundColor: '#ffd700', color: '#0a0a0f', fontWeight: '800', fontSize: '14px', textDecoration: 'none', borderRadius: '12px', boxShadow: '0 4px 15px rgba(255,215,0,0.3)', cursor: 'pointer' },

    // Order Cards
    ordersList: { display: 'flex', flexDirection: 'column', gap: '20px' },
    card: { backgroundColor: '#14141e', border: '1px solid rgba(255,215,0,0.2)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' },
    cardImage: { width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', backgroundColor: '#1e1e2e', flexShrink: 0 },
    cardInfo: { flex: 1 },
    cardTitle: { fontSize: '18px', fontWeight: '800', margin: '0 0 5px 0', color: '#ffd700' },
    cardMeta: { fontSize: '13px', color: '#a0a0b0', margin: '0 0 8px 0' },
    cardStatus: { display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
    statusPaid: { backgroundColor: 'rgba(234,179,8,0.15)', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)' },
    statusDelivered: { backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' },
    cardRight: { textAlign: 'right' },
    cardPrice: { fontSize: '24px', fontWeight: '900', color: '#ffffff', margin: '0 0 5px 0' },
    detailsBtn: { display: 'block', padding: '8px 16px', backgroundColor: 'transparent', color: '#eab308', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textDecoration: 'none' },

    // Logout
    logoutWrap: { textAlign: 'center', marginTop: '40px' },
    logoutBtn: { padding: '12px 30px', backgroundColor: 'transparent', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Orders & Vault</h1>
        <p style={styles.subtitle}>Here are your purchased accounts and their details</p>
      </div>

      <div style={styles.container}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>Loading your orders...</div>
        ) : orders.length === 0 ? (
          /* EMPTY STATE */
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <h2 style={styles.emptyTitle}>No orders yet</h2>
            <p style={styles.emptyText}>
              You haven't bought any accounts yet.<br/>
              Explore our premium Clash of Clans marketplace!
            </p>
            <div style={styles.browseBtn} onClick={() => navigate('/shop')}>
              Browse Accounts
            </div>
          </div>
        ) : (
          /* ORDERS LIST */
          <div style={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} style={styles.card}>
                <div style={styles.cardImage}>
                  {order.accounts?.image_url ? (
                    <img src={order.accounts.image_url} alt="Account" style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>🏰</div>
                  )}
                </div>
                <div style={styles.cardInfo}>
                  <div style={styles.cardTitle}>TH{order.accounts?.town_hall} Maxed Account</div>
                  <div style={styles.cardMeta}>{order.buyer_email}</div>
                  <span style={{ ...styles.cardStatus, ...(order.status === 'delivered' ? styles.statusDelivered : styles.statusPaid) }}>
                    {order.status}
                  </span>
                </div>
                <div style={styles.cardRight}>
                  <div style={styles.cardPrice}>₹{order.amount}</div>
                  {order.status === 'delivered' && order.account_password && (
                    <a href={`/account/${order.account_id}`} style={styles.detailsBtn}>View Details</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.logoutWrap}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}