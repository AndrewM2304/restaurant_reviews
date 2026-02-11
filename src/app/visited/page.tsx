'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import type { ServiceType, Thumb } from '@/core/domain/types';
import { RestaurantCard } from '@/features/restaurants/components/RestaurantCard';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';

const allThumbs: Thumb[] = ['up', 'neutral', 'down'];
const allServiceTypes: ServiceType[] = ['eat_in', 'takeaway', 'delivery'];

export default function VisitedPage() {
  const restaurantsUsecases = useRestaurants();
  const [restaurants, setRestaurants] = useState<Awaited<ReturnType<typeof restaurantsUsecases.listVisited>>>([]);
  const [query, setQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [thumbFilter, setThumbFilter] = useState<Thumb[]>([]);
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceType[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'most_visited' | 'recently_visited' | 'name'>('recently_visited');

  const refresh = useCallback(async () => {
    setRestaurants(
      await restaurantsUsecases.listVisited(
        {
          search: query,
          cuisines: cuisineFilter
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
          thumbs: thumbFilter,
          serviceTypes: serviceTypeFilter,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
        sortBy,
      ),
    );
  }, [cuisineFilter, fromDate, query, restaurantsUsecases, serviceTypeFilter, sortBy, thumbFilter, toDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleThumb = (thumb: Thumb) => {
    setThumbFilter((current) => (current.includes(thumb) ? current.filter((value) => value !== thumb) : [...current, thumb]));
  };

  const toggleServiceType = (serviceType: ServiceType) => {
    setServiceTypeFilter((current) =>
      current.includes(serviceType) ? current.filter((value) => value !== serviceType) : [...current, serviceType],
    );
  };

  const filterLabel = useMemo(() => {
    const parts = [];
    if (thumbFilter.length) parts.push(`thumb: ${thumbFilter.join(', ')}`);
    if (serviceTypeFilter.length) parts.push(`service: ${serviceTypeFilter.join(', ')}`);
    if (fromDate || toDate) parts.push(`dates: ${fromDate || '...'} → ${toDate || '...'}`);
    return parts.join(' | ');
  }, [fromDate, serviceTypeFilter, thumbFilter, toDate]);

  return (
    <section>
      <h2>Visited</h2>
      <form
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void refresh();
        }}
        style={{ display: 'grid', gap: 8, marginBottom: 16 }}
      >
        <input placeholder="Search restaurant" value={query} onChange={(event) => setQuery(event.target.value)} />
        <input
          placeholder="Cuisine tags (comma separated)"
          value={cuisineFilter}
          onChange={(event) => setCuisineFilter(event.target.value)}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {allThumbs.map((thumb) => (
            <button
              key={thumb}
              type="button"
              onClick={() => toggleThumb(thumb)}
              style={{ background: thumbFilter.includes(thumb) ? '#dbeafe' : '#f3f4f6' }}
            >
              {thumb}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {allServiceTypes.map((serviceType) => (
            <button
              key={serviceType}
              type="button"
              onClick={() => toggleServiceType(serviceType)}
              style={{ background: serviceTypeFilter.includes(serviceType) ? '#dcfce7' : '#f3f4f6' }}
            >
              {serviceType}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
            <option value="recently_visited">Recently visited</option>
            <option value="most_visited">Most visited</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
          <button type="submit">Apply</button>
        </div>
      </form>

      {filterLabel ? <p style={{ marginTop: -6 }}>Active filters: {filterLabel}</p> : null}

      <div style={{ display: 'grid', gap: 12 }}>
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            computedThumb={restaurant.computedThumb}
            visitCount={restaurant.visitCount}
            lastVisited={restaurant.lastVisited}
          />
        ))}
        {!restaurants.length ? <p>No active restaurants yet.</p> : null}
      </div>
    </section>
  );
}
