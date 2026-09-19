import './globals.css';
import AppShell from '../src/components/AppShell';
import CookieBanner from '../src/CookieBanner';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'AllGamersMarket | Gaming Marketplace',
    template: '%s | AllGamersMarket',
  },
  description: 'A marketplace for permitted digital gaming products and services.',
  icons: { icon: '/favicon.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fafaf9',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
        <CookieBanner />
      </body>
    </html>
  );
}
