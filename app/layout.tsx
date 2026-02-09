import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Restaurant Reviews',
  description: 'Basic Next.js app starter',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
