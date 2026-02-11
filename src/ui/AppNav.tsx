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
    <nav style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 999,
              textDecoration: 'none',
              background: active ? 'linear-gradient(135deg,#0f766e,#14b8a6)' : 'rgba(255,255,255,0.8)',
              border: active ? '1px solid transparent' : '1px solid #cbd5e1',
              color: active ? 'white' : '#0f172a',
              boxShadow: active ? '0 8px 20px rgba(20,184,166,0.24)' : 'none',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
