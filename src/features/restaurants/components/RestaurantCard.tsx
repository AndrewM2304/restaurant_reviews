import type { Restaurant, Thumb } from '@/core/domain/types';

export function RestaurantCard({
  restaurant,
  computedThumb,
  visitCount,
  lastVisited,
}: {
  restaurant: Restaurant;
  computedThumb?: Thumb;
  visitCount?: number;
  lastVisited?: string;
}) {
  return (
    <article style={{ border: '1px solid #d1d5db', borderRadius: 10, padding: 12 }}>
      <h3 style={{ margin: 0 }}>{restaurant.name}</h3>
      <p style={{ margin: '0.3rem 0' }}>Status: {restaurant.status}</p>
      {computedThumb ? <p style={{ margin: '0.3rem 0' }}>Rating: {computedThumb}</p> : null}
      {typeof visitCount === 'number' ? <p style={{ margin: '0.3rem 0' }}>Visits: {visitCount}</p> : null}
      {lastVisited ? <p style={{ margin: '0.3rem 0' }}>Last visited: {lastVisited}</p> : null}
      <p style={{ margin: '0.3rem 0' }}>Cuisines: {restaurant.cuisines.join(', ') || 'None'}</p>
      {restaurant.notes ? <p style={{ margin: '0.3rem 0' }}>Notes: {restaurant.notes}</p> : null}
    </article>
  );
}
