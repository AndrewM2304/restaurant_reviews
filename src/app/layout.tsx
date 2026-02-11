import type { Metadata } from 'next';

import { AppNav } from '@/ui/AppNav';

import './globals.css';

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
      <body>
        <main>
          <h1>Food Tracker</h1>
          <AppNav />
          {children}
        </main>
      </body>
    </html>
  );
}
