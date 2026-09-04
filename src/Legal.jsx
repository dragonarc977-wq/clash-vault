import React from 'react';
import './App.css';

export default function Legal() {
  return (
    <div className="legal-container">
      <h1>Clash Vault - Terms of Service</h1>
      <p>Last Updated: September 2026</p>
      
      <h2>1. Introduction</h2>
      <p>Welcome to Clash Vault. By accessing or purchasing from this website, you agree to be bound by these Terms of Service.</p>

      <h2>2. Account Purchases</h2>
      <p>All account purchases are final. The buyer receives the account details immediately after payment confirmation through Razorpay.</p>

      <h2>3. Refund Policy</h2>
      <p>Due to the digital nature of our products, we do not offer refunds once an account has been delivered. Please contact support if you have any issues.</p>

      <h2>4. Prohibited Activities</h2>
      <ul>
        <li>Attempting to reverse the transaction after delivery.</li>
        <li>Using the purchased account for illegal activities.</li>
        <li>Sharing purchased login details with third parties.</li>
      </ul>

      <h2>5. Account Recovery</h2>
      <p>We offer a 7-day warranty on all accounts. If the account is recovered by the original owner, we will provide a replacement or a refund.</p>

      <h2>6. Changes to Terms</h2>
      <p>We reserve the right to modify these terms at any time. Continued use of the website constitutes acceptance of the new terms.</p>
    </div>
  );
}