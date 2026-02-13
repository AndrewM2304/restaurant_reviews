import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Restaurant } from '@/core/domain/types';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';
import { useVisits } from '@/features/visits/hooks/useVisits';
import type { DraftItem, DraftPhoto, TabKey, VisitsViewData } from '@/features/visits/models/visitDraft';

const DEFAULT_RATING = 2;
const today = () => new Date().toISOString().slice(0, 10);

export function useVisitsPage() {
  const restaurantsUsecases = useRestaurants();
  const visitsUsecases = useVisits();

  const [tab, setTab] = useState<TabKey>('locations');
  const [savedLocations, setSavedLocations] = useState<Restaurant[]>([]);
  const [wishlist, setWishlist] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [locationName, setLocationName] = useState('');
  const [visitDate, setVisitDate] = useState(today());
  const [overallRating, setOverallRating] = useState(DEFAULT_RATING);
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

  useEffect(
    () => () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    },
    [],
  );

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

  const resetForm = useCallback(() => {
    setLocationName('');
    setVisitDate(today());
    setOverallRating(DEFAULT_RATING);
    setNotes('');
    setItems([]);
    setItemName('');
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setPhotos([]);
  }, [photos]);

  const addPhotoFromBrowser = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;
    setPhotos((current) => [
      ...current,
      ...selectedFiles.map((file) => ({
        id:
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${file.name}-${Date.now()}-${Math.random()}`,
        storagePath: file.name,
        previewUrl: URL.createObjectURL(file),
        isLoading: true,
      })),
    ]);
    event.target.value = '';
  }, []);

  const markPhotoLoaded = useCallback((photoId: string) => {
    setPhotos((current) =>
      current.map((photo) => (photo.id === photoId ? { ...photo, isLoading: false } : photo)),
    );
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((current) => {
      const photoToRemove = current.find((photo) => photo.id === photoId);
      if (photoToRemove) URL.revokeObjectURL(photoToRemove.previewUrl);
      return current.filter((photo) => photo.id !== photoId);
    });
  }, []);

  const submitVisit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
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
    },
    [
      items,
      locationName,
      notes,
      overallRating,
      photos,
      refreshData,
      resetForm,
      restaurantsUsecases,
      savedLocations,
      visitDate,
      visitsUsecases,
    ],
  );

  const viewData: VisitsViewData = {
    tab,
    searchQuery,
    showModal,
    message,
    locationName,
    visitDate,
    overallRating,
    notes,
    itemName,
    items,
    photos,
    savedLocations,
    filteredLocations,
    filteredWishlist,
  };

  return {
    viewData,
    actions: {
      setTab,
      setSearchQuery,
      openModal: () => setShowModal(true),
      closeModal: () => setShowModal(false),
      setLocationName,
      setVisitDate,
      setOverallRating,
      setNotes,
      setItemName,
      addItem: () => {
        if (!itemName.trim()) return;
        setItems((current) => [...current, { name: itemName.trim() }]);
        setItemName('');
      },
      removeItem: (index: number) => setItems((current) => current.filter((_, i) => i !== index)),
      addPhotoFromBrowser,
      markPhotoLoaded,
      removePhoto,
      submitVisit,
    },
  };
}
