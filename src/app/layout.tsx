import type { Metadata } from 'next';

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
        <main>{children}</main>
      </body>
    </html>
  );
}
