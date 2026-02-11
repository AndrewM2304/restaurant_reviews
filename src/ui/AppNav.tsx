'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/visited', label: 'Visited' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/search', label: 'Search' },
  { href: '/visits', label: 'Visits' },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: '0.4rem 0.7rem',
              borderRadius: 8,
              textDecoration: 'none',
              background: active ? '#111827' : '#e5e7eb',
              color: active ? 'white' : '#111827',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
