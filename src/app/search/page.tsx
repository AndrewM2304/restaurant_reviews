'use client';

import { FormEvent, useState } from 'react';

import type { RestaurantStatus, ServiceType, Thumb } from '@/core/domain/types';
import { useSearch } from '@/features/search/hooks/useSearch';

type SearchTab = 'restaurants' | 'items';

export default function SearchPage() {
  const searchUsecases = useSearch();
  const [tab, setTab] = useState<SearchTab>('restaurants');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<RestaurantStatus | ''>('');
  const [thumb, setThumb] = useState<Thumb | ''>('');
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [cuisines, setCuisines] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [restaurants, setRestaurants] = useState<
    Awaited<ReturnType<typeof searchUsecases.searchRestaurants>>
  >([]);
  const [items, setItems] = useState<Awaited<ReturnType<typeof searchUsecases.searchItems>>>([]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cuisineList = cuisines
      .split(',')
      .map((cuisine) => cuisine.trim())
      .filter(Boolean);

    if (tab === 'restaurants') {
      setRestaurants(
        await searchUsecases.searchRestaurants(query, {
          cuisines: cuisineList,
          status: status || undefined,
          thumbs: thumb ? [thumb] : undefined,
        }),
      );
      return;
    }

    setItems(
      await searchUsecases.searchItems(query, {
        cuisines: cuisineList,
        thumbs: thumb ? [thumb] : undefined,
        serviceTypes: serviceType ? [serviceType] : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
    );
  };

  return (
    <section>
      <h2>Search</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setTab('restaurants')} style={{ fontWeight: tab === 'restaurants' ? 700 : 400 }}>
          Restaurants
        </button>
        <button type="button" onClick={() => setTab('items')} style={{ fontWeight: tab === 'items' ? 700 : 400 }}>
          Items
        </button>
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <input placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
        <input
          placeholder="Cuisine tags (comma separated)"
          value={cuisines}
          onChange={(event) => setCuisines(event.target.value)}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={thumb} onChange={(event) => setThumb(event.target.value as Thumb | '')}>
            <option value="">Any thumb</option>
            <option value="up">up</option>
            <option value="neutral">neutral</option>
            <option value="down">down</option>
          </select>
          {tab === 'restaurants' ? (
            <select value={status} onChange={(event) => setStatus(event.target.value as RestaurantStatus | '')}>
              <option value="">Any status</option>
              <option value="active">active</option>
              <option value="wishlist">wishlist</option>
              <option value="archived">archived</option>
            </select>
          ) : (
            <>
              <select value={serviceType} onChange={(event) => setServiceType(event.target.value as ServiceType | '')}>
                <option value="">Any service</option>
                <option value="eat_in">eat_in</option>
                <option value="takeaway">takeaway</option>
                <option value="delivery">delivery</option>
              </select>
              <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
              <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
            </>
          )}
          <button type="submit">Search</button>
        </div>
      </form>

      {tab === 'restaurants' ? (
        <ul>
          {restaurants.map((restaurant) => (
            <li key={restaurant.id}>
              {restaurant.name} [{restaurant.status}] | rating: {restaurant.computedThumb} | last visited:{' '}
              {restaurant.lastVisited ?? 'N/A'}
            </li>
          ))}
          {!restaurants.length ? <li>No matching restaurants.</li> : null}
        </ul>
      ) : (
        <ul>
          {items.map((result) => (
            <li key={result.item.id}>
              {result.item.name} ({result.item.thumb}) at {result.restaurant.name} on {result.visit.visitDate} via{' '}
              {result.visit.serviceType}
            </li>
          ))}
          {!items.length ? <li>No matching items.</li> : null}
        </ul>
      )}
    </section>
  );
}
