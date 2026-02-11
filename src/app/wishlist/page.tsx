'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

import type { Restaurant, ServiceType, Thumb } from '@/core/domain/types';
import { RestaurantCard } from '@/features/restaurants/components/RestaurantCard';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';
import { useVisits } from '@/features/visits/hooks/useVisits';

export default function WishlistPage() {
  const restaurantsUsecases = useRestaurants();
  const visitsUsecases = useVisits();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [name, setName] = useState('');
  const [cuisines, setCuisines] = useState('');
  const [search, setSearch] = useState('');
  const [quickVisitDate, setQuickVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [quickServiceType, setQuickServiceType] = useState<ServiceType>('eat_in');
  const [quickThumb, setQuickThumb] = useState<Thumb>('up');

  const refresh = useCallback(async () => {
    setRestaurants(
      await restaurantsUsecases.listWishlist({
        search,
      }),
    );
  }, [restaurantsUsecases, search]);

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

  const quickAddVisit = async (restaurantId: string) => {
    await visitsUsecases.addVisit({
      restaurantId,
      visitDate: quickVisitDate,
      serviceType: quickServiceType,
      overallThumb: quickThumb,
    });
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

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="Search by name" value={search} onChange={(event) => setSearch(event.target.value)} />
        <input type="date" value={quickVisitDate} onChange={(event) => setQuickVisitDate(event.target.value)} />
        <select
          value={quickServiceType}
          onChange={(event) => setQuickServiceType(event.target.value as ServiceType)}
        >
          <option value="eat_in">eat_in</option>
          <option value="takeaway">takeaway</option>
          <option value="delivery">delivery</option>
        </select>
        <select value={quickThumb} onChange={(event) => setQuickThumb(event.target.value as Thumb)}>
          <option value="up">up</option>
          <option value="neutral">neutral</option>
          <option value="down">down</option>
        </select>
        <button type="button" onClick={() => void refresh()}>
          Filter
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {restaurants.map((restaurant) => (
          <div key={restaurant.id}>
            <RestaurantCard restaurant={restaurant} />
            <button type="button" onClick={() => void quickAddVisit(restaurant.id)}>
              Add visit (moves to active)
            </button>
          </div>
        ))}
        {!restaurants.length ? <p>No wishlist restaurants yet.</p> : null}
      </div>
    </section>
  );
}
