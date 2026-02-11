'use client';

import { FormEvent, useEffect, useState } from 'react';

import type { Restaurant, ServiceType, Thumb } from '@/core/domain/types';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';
import { useVisits } from '@/features/visits/hooks/useVisits';

interface DraftItem {
  name: string;
  thumb: Thumb;
  notes?: string;
}

interface DraftPhoto {
  storagePath: string;
  caption?: string;
}

export default function VisitsPage() {
  const restaurantsUsecases = useRestaurants();
  const visitsUsecases = useVisits();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [serviceType, setServiceType] = useState<ServiceType>('eat_in');
  const [overallThumb, setOverallThumb] = useState<Thumb>('neutral');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemThumb, setItemThumb] = useState<Thumb>('up');
  const [itemNotes, setItemNotes] = useState('');
  const [photoPath, setPhotoPath] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    void restaurantsUsecases.listVisited({}).then((visited) => {
      setRestaurants(visited);
      if (!restaurantId && visited[0]) {
        setRestaurantId(visited[0].id);
      }
    });
  }, [restaurantId, restaurantsUsecases]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!restaurantId || !visitDate || !serviceType || !overallThumb) {
      setMessage('Restaurant, date, service type and thumb are required.');
      return;
    }

    await visitsUsecases.addVisit({
      restaurantId,
      visitDate,
      serviceType,
      overallThumb,
      notes: notes || undefined,
      items,
      photos,
    });

    setItems([]);
    setPhotos([]);
    setNotes('');
    setMessage('Saved visit with items/photos.');
  };

  return (
    <section>
      <h2>Add / Edit Visit</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 700 }}>
        <select value={restaurantId} onChange={(event) => setRestaurantId(event.target.value)}>
          <option value="">Select restaurant</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
        <input type="date" required value={visitDate} onChange={(event) => setVisitDate(event.target.value)} />
        <select required value={serviceType} onChange={(event) => setServiceType(event.target.value as ServiceType)}>
          <option value="eat_in">eat_in</option>
          <option value="takeaway">takeaway</option>
          <option value="delivery">delivery</option>
        </select>
        <select required value={overallThumb} onChange={(event) => setOverallThumb(event.target.value as Thumb)}>
          <option value="up">up</option>
          <option value="neutral">neutral</option>
          <option value="down">down</option>
        </select>
        <textarea placeholder="Visit notes" value={notes} onChange={(event) => setNotes(event.target.value)} />

        <fieldset>
          <legend>Items</legend>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Item name" value={itemName} onChange={(event) => setItemName(event.target.value)} />
            <select value={itemThumb} onChange={(event) => setItemThumb(event.target.value as Thumb)}>
              <option value="up">up</option>
              <option value="neutral">neutral</option>
              <option value="down">down</option>
            </select>
            <input placeholder="Item notes" value={itemNotes} onChange={(event) => setItemNotes(event.target.value)} />
            <button
              type="button"
              onClick={() => {
                if (!itemName.trim()) return;
                setItems((current) => [...current, { name: itemName.trim(), thumb: itemThumb, notes: itemNotes || undefined }]);
                setItemName('');
                setItemNotes('');
              }}
            >
              Add item
            </button>
          </div>
          <ul>
            {items.map((item, index) => (
              <li key={`${item.name}-${index}`}>
                {item.name} ({item.thumb}) {item.notes ? `- ${item.notes}` : ''}{' '}
                <button type="button" onClick={() => setItems((current) => current.filter((_, i) => i !== index))}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </fieldset>

        <fieldset>
          <legend>Photos</legend>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              placeholder="Photo file/ref path"
              value={photoPath}
              onChange={(event) => setPhotoPath(event.target.value)}
            />
            <input placeholder="Caption" value={photoCaption} onChange={(event) => setPhotoCaption(event.target.value)} />
            <button
              type="button"
              onClick={() => {
                if (!photoPath.trim()) return;
                setPhotos((current) => [...current, { storagePath: photoPath.trim(), caption: photoCaption || undefined }]);
                setPhotoPath('');
                setPhotoCaption('');
              }}
            >
              Add photo ref
            </button>
          </div>
          <ul>
            {photos.map((photo, index) => (
              <li key={`${photo.storagePath}-${index}`}>
                {photo.storagePath} {photo.caption ? `(${photo.caption})` : ''}{' '}
                <button type="button" onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Save visit</button>
        {message ? <p>{message}</p> : null}
      </form>
    </section>
  );
}
