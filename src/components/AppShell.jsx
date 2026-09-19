'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import SiteFooter from './SiteFooter';
import { initializeTheme } from '../lib/theme';

const accountPaths = [
  '/dashboard',
  '/balance',
  '/my-orders',
  '/notifications',
  '/support',
  '/seller',
  '/seller-chat',
  '/my-products',
  '/become-a-seller',
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith('/admin');
  const compactAccountPage = accountPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  useEffect(() => {
    initializeTheme();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={`app-wrapper${compactAccountPage ? ' account-area' : ''}`}>
      {!hideChrome && <Navbar />}
      {children}
      {!hideChrome && <SiteFooter />}
    </div>
  );
}
