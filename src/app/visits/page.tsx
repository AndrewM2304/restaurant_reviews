'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { MinusIcon, PlusIcon, SmileyIcon, SmileyMehIcon, SmileySadIcon } from '@/vendor/phosphor/react';

import type { Restaurant } from '@/core/domain/types';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';
import { useVisits } from '@/features/visits/hooks/useVisits';

import styles from './visits.module.css';

interface DraftItem {
  name: string;
}

interface DraftPhoto {
  storagePath: string;
  previewUrl: string;
}

type TabKey = 'locations' | 'wishlist';

export default function VisitsPage() {
  const restaurantsUsecases = useRestaurants();
  const visitsUsecases = useVisits();

  const [tab, setTab] = useState<TabKey>('locations');
  const [savedLocations, setSavedLocations] = useState<Restaurant[]>([]);
  const [wishlist, setWishlist] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [locationName, setLocationName] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [overallRating, setOverallRating] = useState(2);
  const [notes, setNotes] = useState('');

  const [itemName, setItemName] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);

  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const photosRef = useRef<DraftPhoto[]>([]);

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!showModal) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showModal]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

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
    setWishlist(wishlist.sort((a, b) => a.name.localeCompare(b.name)));
  }, [restaurantsUsecases]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const filteredLocations = useMemo(
    () =>
      savedLocations.filter((restaurant) => restaurant.name.toLowerCase().includes(searchQuery.toLowerCase().trim())),
    [savedLocations, searchQuery],
  );

  const filteredWishlist = useMemo(
    () => wishlist.filter((restaurant) => restaurant.name.toLowerCase().includes(searchQuery.toLowerCase().trim())),
    [searchQuery, wishlist],
  );

  const resetForm = () => {
    setLocationName('');
    setVisitDate(new Date().toISOString().slice(0, 10));
    setOverallRating(2);
    setNotes('');
    setItems([]);
    setItemName('');
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setPhotos([]);
  };

  const addPhotoFromBrowser = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;
    setPhotos((current) => [
      ...current,
      ...selectedFiles.map((file) => ({
        storagePath: file.name,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    event.target.value = '';
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((current) => {
      const photoToRemove = current[indexToRemove];
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }
      return current.filter((_, index) => index !== indexToRemove);
    });
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
      serviceType: 'eat_in',
      overallThumb: overallRating <= 1 ? 'down' : overallRating >= 3 ? 'up' : 'neutral',
      notes: notes || undefined,
      items: items.map((item) => ({ ...item, thumb: 'neutral' })),
      photos,
    });

    await refreshData();
    setMessage('Visit saved.');
    resetForm();
    setShowModal(false);
  };

  return (
    <section className={styles.page}>
      <div className={styles.tabs}>
        <span className={`${styles.tabThumb} ${tab === 'wishlist' ? styles.thumbRight : ''}`} aria-hidden="true" />
        <button
          className={`${styles.tab} ${tab === 'locations' ? styles.activeTab : ''}`}
          onClick={() => setTab('locations')}
          type="button"
        >
          Locations
        </button>
        <button
          className={`${styles.tab} ${tab === 'wishlist' ? styles.activeTab : ''}`}
          onClick={() => setTab('wishlist')}
          type="button"
        >
          Wish list
        </button>
      </div>

      <input
        className={styles.search}
        placeholder={tab === 'locations' ? 'Search locations' : 'Search wish list'}
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />

      {tab === 'locations' ? (
        <div className={styles.cardGrid}>
          {filteredLocations.map((location) => (
            <article key={location.id} className={styles.locationCard}>
              <h3>{location.name}</h3>
              <p className={styles.meta}>{location.status === 'active' ? 'Visited location' : 'Wishlist location'}</p>
            </article>
          ))}
          {!filteredLocations.length ? <p className={styles.empty}>No saved locations yet.</p> : null}
        </div>
      ) : (
        <div className={styles.cardGrid}>
          {filteredWishlist.map((restaurant) => (
            <article key={restaurant.id} className={styles.locationCard}>
              <h3>{restaurant.name}</h3>
              <p className={styles.meta}>Wish list location</p>
            </article>
          ))}
          {!filteredWishlist.length ? <p className={styles.empty}>No wish list locations yet.</p> : null}
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

                <div className={styles.scaleField}>
                  <label htmlFor="overall-scale">Rating</label>
                  <div className={styles.scaleLabels} aria-hidden="true">
                    <span className={styles.scaleLabelStart}><SmileySadIcon weight={overallRating === 0 ? 'duotone' : 'light'} /></span>
                    <span className={styles.scaleLabelCenter}><SmileyMehIcon weight={overallRating === 2 ? 'duotone' : 'light'} /></span>
                    <span className={styles.scaleLabelEnd}><SmileyIcon weight={overallRating === 4 ? 'duotone' : 'light'} /></span>
                  </div>
                  <input
                    id="overall-scale"
                    type="range"
                    min={0}
                    max={4}
                    step={1}
                    value={overallRating}
                    onChange={(event) => setOverallRating(Number(event.target.value))}
                  />
                </div>

                <textarea placeholder="Visit notes (optional)" value={notes} onChange={(event) => setNotes(event.target.value)} />

                <div className={styles.itemEditor}>
                  <h4 className="app-heading-4">Items</h4>
                  <div className={styles.itemRow}>
                    <input placeholder="Item" value={itemName} onChange={(event) => setItemName(event.target.value)} />
                    <button
                      type="button"
                      className={`${styles.iconButton} ${styles.primaryButton}`}
                      onClick={() => {
                        if (!itemName.trim()) return;
                        setItems((current) => [...current, { name: itemName.trim() }]);
                        setItemName('');
                      }}
                    >
                      <PlusIcon />
                    </button>
                  </div>

                  <ul className={styles.list}>
                    {items.map((item, index) => (
                      <li key={`${item.name}-${index}`}>
                        <span>{item.name}</span>
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.secondaryButton}`}
                          onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                        >
                          <MinusIcon />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.itemEditor}>
                  <h4 className="app-heading-4">Photos</h4>
                  <div className={styles.photoUploadRow}>
                    <input
                      id="visit-photo-upload"
                      className={styles.visuallyHidden}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={addPhotoFromBrowser}
                      aria-label="Choose photo from your device"
                    />
                    <label htmlFor="visit-photo-upload" className={`${styles.secondaryButton} ${styles.uploadButton}`}>
                      Upload photos
                    </label>
                  </div>

                  <ul className={`${styles.list} ${styles.photoList}`}>
                    {photos.map((photo, index) => (
                      <li key={`${photo.storagePath}-${index}`}>
                        <Image
                          src={photo.previewUrl}
                          alt={photo.storagePath}
                          className={styles.photoPreview}
                          width={320}
                          height={180}
                          unoptimized
                        />
                        <button
                          type="button"
                          className={`${styles.iconButton} ${styles.secondaryButton}`}
                          onClick={() => removePhoto(index)}
                        >
                          <MinusIcon />
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
