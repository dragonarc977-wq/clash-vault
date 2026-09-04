import React, { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) {
      setShow(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-banner">
      <p>
        We use cookies to improve your experience. By clicking "Accept", you agree to our{' '}
        <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of Service</a>.
      </p>
      <button className="cookie-btn" onClick={acceptCookies}>Accept</button>
    </div>
  );
}