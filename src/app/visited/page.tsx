'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

import type { Restaurant, Thumb } from '@/core/domain/types';
import { RestaurantCard } from '@/features/restaurants/components/RestaurantCard';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';
import { useVisits } from '@/features/visits/hooks/useVisits';

type VisitedRestaurant = Restaurant & { computedThumb: Thumb };

export default function VisitedPage() {
  const restaurantsUsecases = useRestaurants();
  const visitsUsecases = useVisits();
  const [restaurants, setRestaurants] = useState<VisitedRestaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));

  const refresh = useCallback(async () => {
    setRestaurants(await restaurantsUsecases.listVisited());
  }, [restaurantsUsecases]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addVisit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!restaurantId) return;
    await visitsUsecases.addVisit({
      restaurantId,
      visitDate,
      serviceType: 'eat_in',
      overallThumb: 'up',
    });
    setRestaurantId('');
    await refresh();
  };

  return (
    <section>
      <h2>Visited</h2>
      <form onSubmit={addVisit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select value={restaurantId} onChange={(event) => setRestaurantId(event.target.value)}>
          <option value="">Select restaurant</option>
          {restaurants.map((restaurant) => (
            <option value={restaurant.id} key={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
        <input type="date" value={visitDate} onChange={(event) => setVisitDate(event.target.value)} />
        <button type="submit">Add Visit</button>
      </form>

      <div style={{ display: 'grid', gap: 12 }}>
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} computedThumb={restaurant.computedThumb} />
        ))}
        {!restaurants.length ? <p>No active restaurants yet.</p> : null}
      </div>
    </section>
  );
}
