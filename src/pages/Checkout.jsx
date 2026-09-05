import { useParams, useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: '120px', minHeight: '100vh', background: '#0a0a0f', color: '#ffffff', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ color: '#ffd700', fontSize: '36px', marginBottom: '20px' }}>Checkout Coming Soon</h1>
      <p style={{ color: '#6b6b7b', marginBottom: '20px' }}>Account ID: {id}</p>
      <p style={{ color: '#a0a0b0', maxWidth: '500px', margin: '0 auto 30px' }}>
        We are currently setting up Razorpay for instant delivery. 
        Please contact us on WhatsApp to buy this account right now!
      </p>
      <button 
        onClick={() => navigate('/')} 
        style={{
          padding: '12px 24px', background: '#ffd700', color: '#0a0a0f', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer'
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}