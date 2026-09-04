import React from 'react';
import './App.css';

export default function Privacy() {
  return (
    <div className="legal-container">
      <h1>Privacy Policy</h1>
      <p>Last Updated: September 2026</p>
      
      <h2>1. Information We Collect</h2>
      <p>We collect your email address, Google account ID (for authentication), and purchase history.</p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To process your orders and deliver account details.</li>
        <li>To provide customer support via WhatsApp.</li>
        <li>To improve our website experience.</li>
      </ul>

      <h2>3. Data Security</h2>
      <p>All data is stored securely using Supabase Row Level Security (RLS). Your payment information is handled entirely by Razorpay and never touches our servers.</p>

      <h2>4. Cookies</h2>
      <p>We use cookies to remember your login session and to improve your browsing experience. You can disable cookies in your browser settings.</p>

      <h2>5. Your Rights</h2>
      <p>You have the right to request the deletion of your personal data from our servers at any time by contacting us.</p>

      <h2>6. Third-Party Services</h2>
      <p>We use Google (for login), Razorpay (for payments), and Cloudflare (for hosting). These services have their own privacy policies.</p>
    </div>
  );
}