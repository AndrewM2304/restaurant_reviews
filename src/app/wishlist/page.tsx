'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

import type { Restaurant } from '@/core/domain/types';
import { RestaurantCard } from '@/features/restaurants/components/RestaurantCard';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';

export default function WishlistPage() {
  const restaurantsUsecases = useRestaurants();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [name, setName] = useState('');
  const [cuisines, setCuisines] = useState('');

  const refresh = useCallback(async () => {
    setRestaurants(await restaurantsUsecases.listWishlist());
  }, [restaurantsUsecases]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    await restaurantsUsecases.addRestaurant({
      name: name.trim(),
      cuisines: cuisines
        .split(',')
        .map((cuisine) => cuisine.trim())
        .filter(Boolean),
      status: 'wishlist',
    });

    setName('');
    setCuisines('');
    await refresh();
  };

  return (
    <section>
      <h2>Wishlist</h2>
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="Restaurant name" value={name} onChange={(event) => setName(event.target.value)} />
        <input
          placeholder="Cuisines (comma separated)"
          value={cuisines}
          onChange={(event) => setCuisines(event.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      <div style={{ display: 'grid', gap: 12 }}>
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
        {!restaurants.length ? <p>No wishlist restaurants yet.</p> : null}
      </div>
    </section>
  );
}
