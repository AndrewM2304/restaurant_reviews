'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

import type { Restaurant, ServiceType, Thumb } from '@/core/domain/types';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';
import { useVisits } from '@/features/visits/hooks/useVisits';

import styles from './visits.module.css';

interface DraftItem {
  name: string;
  thumb: Exclude<Thumb, 'neutral'>;
}

interface DraftPhoto {
  storagePath: string;
  caption?: string;
}

type VisitThumb = Exclude<Thumb, 'neutral'>;

type TabKey = 'locations' | 'activity';

const allServiceTypes: ServiceType[] = ['eat_in', 'takeaway', 'delivery'];

function ThumbUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 9V5.414c0-.89 1.077-1.337 1.707-.707l3.586 3.586a1 1 0 0 1 .293.707V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h7Z"
      />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 15v3.586c0 .89-1.077 1.337-1.707.707l-3.586-3.586A1 1 0 0 1 4.414 15V6a2 2 0 0 1 2-2h10.172a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10Z"
      />
    </svg>
  );
}

export default function VisitsPage() {
  const restaurantsUsecases = useRestaurants();
  const visitsUsecases = useVisits();

  const [tab, setTab] = useState<TabKey>('locations');
  const [savedLocations, setSavedLocations] = useState<Restaurant[]>([]);
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof restaurantsUsecases.listVisited>>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [locationName, setLocationName] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [serviceType, setServiceType] = useState<ServiceType>('eat_in');
  const [overallThumb, setOverallThumb] = useState<VisitThumb>('up');
  const [notes, setNotes] = useState('');

  const [itemName, setItemName] = useState('');
  const [itemThumb, setItemThumb] = useState<VisitThumb>('up');
  const [items, setItems] = useState<DraftItem[]>([]);

  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [photoCaption, setPhotoCaption] = useState('');

  const [message, setMessage] = useState('');

  const refreshData = useCallback(async () => {
    const [wishlist, visited] = await Promise.all([
      restaurantsUsecases.listWishlist({}),
      restaurantsUsecases.listVisited({}),
    ]);

    const merged = [...visited, ...wishlist].reduce<Restaurant[]>((current, entry) => {
      if (current.some((restaurant) => restaurant.id === entry.id)) return current;
      current.push(entry);
      return current;
    }, []);

    setSavedLocations(merged.sort((a, b) => a.name.localeCompare(b.name)));
    setActivity(visited);
  }, [restaurantsUsecases]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const filteredLocations = useMemo(
    () =>
      savedLocations.filter((restaurant) => restaurant.name.toLowerCase().includes(searchQuery.toLowerCase().trim())),
    [savedLocations, searchQuery],
  );

  const resetForm = () => {
    setLocationName('');
    setVisitDate(new Date().toISOString().slice(0, 10));
    setServiceType('eat_in');
    setOverallThumb('up');
    setNotes('');
    setItems([]);
    setItemName('');
    setItemThumb('up');
    setPhotos([]);
    setPhotoCaption('');
  };

  const addPhotoFromBrowser = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setPhotos((current) => [...current, { storagePath: selectedFile.name, caption: photoCaption || undefined }]);
    setPhotoCaption('');
    event.target.value = '';
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const inputName = locationName.trim();

    if (!inputName || !visitDate) {
      setMessage('Location and date are required.');
      return;
    }

    const existing = savedLocations.find((restaurant) => restaurant.name.toLowerCase() === inputName.toLowerCase());
    const restaurant =
      existing ??
      (await restaurantsUsecases.addRestaurant({
        name: inputName,
        cuisines: [],
        status: 'active',
      }));

    await visitsUsecases.addVisit({
      restaurantId: restaurant.id,
      visitDate,
      serviceType,
      overallThumb,
      notes: notes || undefined,
      items,
      photos,
    });

    await refreshData();
    setMessage('Visit saved.');
    resetForm();
    setShowModal(false);
  };

  return (
    <section className={styles.page}>
      <h2 className={styles.heading}>Visits</h2>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'locations' ? styles.activeTab : ''}`} onClick={() => setTab('locations')}>
          Locations
        </button>
        <button className={`${styles.tab} ${tab === 'activity' ? styles.activeTab : ''}`} onClick={() => setTab('activity')}>
          Activity
        </button>
      </div>

      {tab === 'locations' ? (
        <>
          <input
            className={styles.search}
            placeholder="Search saved locations"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <div className={styles.cardGrid}>
            {filteredLocations.map((location) => (
              <article key={location.id} className={styles.locationCard}>
                <h3>{location.name}</h3>
                <p className={styles.meta}>{location.status === 'active' ? 'Visited location' : 'Wishlist location'}</p>
              </article>
            ))}
            {!filteredLocations.length ? <p className={styles.empty}>No saved locations yet.</p> : null}
          </div>
        </>
      ) : (
        <div className={styles.cardGrid}>
          {activity.map((restaurant) => (
            <article key={restaurant.id} className={styles.locationCard}>
              <h3>{restaurant.name}</h3>
              <p className={styles.meta}>Visits: {restaurant.visitCount}</p>
              <p className={styles.meta}>Latest: {restaurant.lastVisited ?? '—'}</p>
            </article>
          ))}
          {!activity.length ? <p className={styles.empty}>No activity yet.</p> : null}
        </div>
      )}

      <button className={styles.fab} onClick={() => setShowModal(true)} aria-label="Add visit">
        +
      </button>

      {showModal ? (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <h3>Add visit</h3>
            <form className={styles.form} onSubmit={submit}>
              <input
                list="saved-locations"
                placeholder="Search or type location"
                value={locationName}
                onChange={(event) => setLocationName(event.target.value)}
                required
              />
              <datalist id="saved-locations">
                {savedLocations.map((restaurant) => (
                  <option value={restaurant.name} key={restaurant.id} />
                ))}
              </datalist>

              <input type="date" value={visitDate} onChange={(event) => setVisitDate(event.target.value)} required />

              <select value={serviceType} onChange={(event) => setServiceType(event.target.value as ServiceType)}>
                {allServiceTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <div className={styles.thumbRow}>
                <span>Overall</span>
                <button
                  className={`${styles.thumbButton} ${overallThumb === 'up' ? styles.thumbActive : ''}`}
                  type="button"
                  onClick={() => setOverallThumb('up')}
                  aria-label="Thumbs up"
                >
                  <ThumbUpIcon />
                </button>
                <button
                  className={`${styles.thumbButton} ${overallThumb === 'down' ? styles.thumbActive : ''}`}
                  type="button"
                  onClick={() => setOverallThumb('down')}
                  aria-label="Thumbs down"
                >
                  <ThumbDownIcon />
                </button>
              </div>

              <textarea placeholder="Visit notes (optional)" value={notes} onChange={(event) => setNotes(event.target.value)} />

              <div className={styles.itemEditor}>
                <h4>Items</h4>
                <div className={styles.itemRow}>
                  <input placeholder="Item" value={itemName} onChange={(event) => setItemName(event.target.value)} />
                  <button
                    className={`${styles.thumbButton} ${itemThumb === 'up' ? styles.thumbActive : ''}`}
                    type="button"
                    onClick={() => setItemThumb('up')}
                    aria-label="Item thumbs up"
                  >
                    <ThumbUpIcon />
                  </button>
                  <button
                    className={`${styles.thumbButton} ${itemThumb === 'down' ? styles.thumbActive : ''}`}
                    type="button"
                    onClick={() => setItemThumb('down')}
                    aria-label="Item thumbs down"
                  >
                    <ThumbDownIcon />
                  </button>
                  <button
                    type="button"
                    className={styles.inlineButton}
                    onClick={() => {
                      if (!itemName.trim()) return;
                      setItems((current) => [...current, { name: itemName.trim(), thumb: itemThumb }]);
                      setItemName('');
                      setItemThumb('up');
                    }}
                  >
                    Add
                  </button>
                </div>

                <ul className={styles.list}>
                  {items.map((item, index) => (
                    <li key={`${item.name}-${index}`}>
                      <span>{item.name}</span>
                      <span>{item.thumb === 'up' ? '👍' : '👎'}</span>
                      <button type="button" onClick={() => setItems((current) => current.filter((_, i) => i !== index))}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.itemEditor}>
                <h4>Photos</h4>
                <div className={styles.itemRow}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={addPhotoFromBrowser}
                    aria-label="Choose photo from your device"
                  />
                  <input
                    placeholder="Caption (optional)"
                    value={photoCaption}
                    onChange={(event) => setPhotoCaption(event.target.value)}
                  />
                </div>

                <ul className={styles.list}>
                  {photos.map((photo, index) => (
                    <li key={`${photo.storagePath}-${index}`}>
                      <span>{photo.storagePath}</span>
                      <span>{photo.caption ?? 'No caption'}</span>
                      <button type="button" onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">Save visit</button>
              </div>
              {message ? <p className={styles.message}>{message}</p> : null}
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
