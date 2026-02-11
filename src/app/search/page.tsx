'use client';

import { FormEvent, useState } from 'react';

import type { Restaurant, SearchItemResult } from '@/core/domain/types';
import { useSearch } from '@/features/search/hooks/useSearch';

export default function SearchPage() {
  const searchUsecases = useSearch();
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [items, setItems] = useState<SearchItemResult[]>([]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const [restaurantResults, itemResults] = await Promise.all([
      searchUsecases.searchRestaurants(query),
      searchUsecases.searchItems(query),
    ]);
    setRestaurants(restaurantResults);
    setItems(itemResults);
  };

  return (
    <section>
      <h2>Search</h2>
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="Search restaurants/items" value={query} onChange={(event) => setQuery(event.target.value)} />
        <button type="submit">Search</button>
      </form>

      <h3>Restaurants</h3>
      <ul>
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            {restaurant.name} ({restaurant.status})
          </li>
        ))}
        {!restaurants.length ? <li>No matching restaurants.</li> : null}
      </ul>

      <h3>Items</h3>
      <ul>
        {items.map((result) => (
          <li key={result.item.id}>
            {result.item.name} at {result.restaurant.name} ({result.visit.visitDate})
          </li>
        ))}
        {!items.length ? <li>No matching items.</li> : null}
      </ul>
    </section>
  );
}
