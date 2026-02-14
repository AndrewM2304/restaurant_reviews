import Link from 'next/link';

import type { Restaurant } from '@/core/domain/types';
import styles from '@/app/visits/visits.module.css';

interface LocationCardsProps {
  restaurants: Restaurant[];
  emptyMessage: string;
  showStatus: boolean;
}

export function LocationCards({ restaurants, emptyMessage, showStatus }: LocationCardsProps) {
  return (
    <div className={styles.cardGrid}>
      {restaurants.map((restaurant) => (
        <Link key={restaurant.id} href={`/location?id=${restaurant.id}`} className={styles.locationCardLink}>
          <article className={styles.locationCard}>
            <h3>{restaurant.name}</h3>
            <p className={styles.meta}>
              {showStatus ? (restaurant.status === 'active' ? 'Visited location' : 'Wishlist location') : 'Wish list location'}
            </p>
          </article>
        </Link>
      ))}
      {!restaurants.length ? <p className={styles.empty}>{emptyMessage}</p> : null}
    </div>
  );
}
