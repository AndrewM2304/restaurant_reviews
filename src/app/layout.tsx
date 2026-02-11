import type { Metadata } from 'next';

import { AppNav } from '@/ui/AppNav';

export const metadata: Metadata = {
  title: 'Food Tracker',
  description: 'Wishlist and visits for restaurants and food items',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, Arial, sans-serif', margin: '0 auto', maxWidth: 900, padding: 20 }}>
        <h1>Food Tracker</h1>
        <AppNav />
        {children}
      </body>
    </html>
  );
}
