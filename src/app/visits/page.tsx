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
}

type VisitThumb = Exclude<Thumb, 'neutral'>;

type TabKey = 'locations' | 'activity';

const dineServiceTypes: ServiceType[] = ['eat_in', 'takeaway'];
const overallSegments = ['Terrible', 'Bad', 'Fine', 'Good', 'Great'] as const;

function HandThumbUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 10.5h4.5v10.5h-4.5V10.5Zm4.5 0 3.136-7.024A1.875 1.875 0 0 1 11.598 2.25h.352c1.036 0 1.875.84 1.875 1.875v2.25h5.237a2.25 2.25 0 0 1 2.208 2.684l-1.2 6A2.25 2.25 0 0 1 17.864 17.25H6.75V10.5Z"
      />
    </svg>
  );
}

function HandThumbDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 13.5h-4.5V3h4.5v10.5Zm-4.5 0-3.136 7.024a1.875 1.875 0 0 1-1.712 1.226h-.352a1.875 1.875 0 0 1-1.875-1.875v-2.25H4.938a2.25 2.25 0 0 1-2.208-2.684l1.2-6A2.25 2.25 0 0 1 6.136 6.75H17.25v6.75Z"
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
  const [overallRating, setOverallRating] = useState(2);
  const [notes, setNotes] = useState('');

  const [itemName, setItemName] = useState('');
  const [itemThumb, setItemThumb] = useState<VisitThumb>('up');
  const [items, setItems] = useState<DraftItem[]>([]);

  const [photos, setPhotos] = useState<DraftPhoto[]>([]);

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
    setOverallRating(2);
    setNotes('');
    setItems([]);
    setItemName('');
    setItemThumb('up');
    setPhotos([]);
  };

  const addPhotoFromBrowser = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    setPhotos((current) => [...current, { storagePath: selectedFile.name }]);
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
      overallThumb: overallRating <= 1 ? 'down' : overallRating >= 3 ? 'up' : 'neutral',
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
      <h2 className="app-heading-2">Visits</h2>

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
            <h3 className="app-heading-3">Add visit</h3>
            <form className={styles.form} onSubmit={submit}>
              <div className={styles.formBody}>
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

                <fieldset className={styles.serviceTypeGroup}>
                  <legend>Service</legend>
                  {dineServiceTypes.map((value) => (
                    <label key={value} className={styles.radioOption}>
                      <input
                        type="radio"
                        name="serviceType"
                        value={value}
                        checked={serviceType === value}
                        onChange={(event) => setServiceType(event.target.value as ServiceType)}
                      />
                      <span>{value === 'eat_in' ? 'Eat in' : 'Take away'}</span>
                    </label>
                  ))}
                </fieldset>

                <div className={styles.scaleField}>
                  <label htmlFor="overall-scale">Rating</label>
                  <input
                    id="overall-scale"
                    type="range"
                    min={0}
                    max={4}
                    step={1}
                    value={overallRating}
                    onChange={(event) => setOverallRating(Number(event.target.value))}
                  />
                  <div className={styles.scaleLabels}>
                    {overallSegments.map((segment) => (
                      <span key={segment}>{segment}</span>
                    ))}
                  </div>
                </div>

                <textarea placeholder="Visit notes (optional)" value={notes} onChange={(event) => setNotes(event.target.value)} />

                <div className={styles.itemEditor}>
                  <h4 className="app-heading-4">Items</h4>
                  <div className={styles.itemRow}>
                    <input placeholder="Item" value={itemName} onChange={(event) => setItemName(event.target.value)} />
                    <button
                      className={`${styles.thumbButton} ${styles.secondaryButton} ${itemThumb === 'up' ? styles.thumbActive : ''}`}
                      type="button"
                      onClick={() => setItemThumb('up')}
                      aria-label="Item thumbs up"
                    >
                      <HandThumbUpIcon />
                    </button>
                    <button
                      className={`${styles.thumbButton} ${styles.secondaryButton} ${itemThumb === 'down' ? styles.thumbActive : ''}`}
                      type="button"
                      onClick={() => setItemThumb('down')}
                      aria-label="Item thumbs down"
                    >
                      <HandThumbDownIcon />
                    </button>
                    <button
                      type="button"
                      className={`${styles.inlineButton} ${styles.primaryButton}`}
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
                        <span className={styles.itemThumbIcon}>{item.thumb === 'up' ? <HandThumbUpIcon /> : <HandThumbDownIcon />}</span>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.itemEditor}>
                  <h4 className="app-heading-4">Photos</h4>
                  <div className={styles.itemRow}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={addPhotoFromBrowser}
                      aria-label="Choose photo from your device"
                    />
                  </div>

                  <ul className={styles.list}>
                    {photos.map((photo, index) => (
                      <li key={`${photo.storagePath}-${index}`}>
                        <span>{photo.storagePath}</span>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.formFooter}>
                <div className={styles.formActions}>
                  <button type="button" className={styles.secondaryButton} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryButton}>
                    Save visit
                  </button>
                </div>
                {message ? <p className={styles.message}>{message}</p> : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
