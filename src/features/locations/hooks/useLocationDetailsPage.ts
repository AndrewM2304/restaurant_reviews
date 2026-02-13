import { useEffect, useMemo, useState } from 'react';

import type { Restaurant, Thumb, Visit, VisitItem, VisitPhoto } from '@/core/domain/types';
import { useRestaurants } from '@/features/restaurants/hooks/useRestaurants';
import { useVisits } from '@/features/visits/hooks/useVisits';

interface VisitWithDetails {
  visit: Visit;
  items: VisitItem[];
  photos: VisitPhoto[];
}

interface LocationDetailsViewData {
  restaurant: Restaurant | null;
  visits: VisitWithDetails[];
  overallRating: Thumb | 'none';
  error: string;
  isLoading: boolean;
}

export function useLocationDetailsPage(locationId: string) {
  const restaurantsUsecases = useRestaurants();
  const visitsUsecases = useVisits();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [visits, setVisits] = useState<VisitWithDetails[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');

      const [active, wishlist] = await Promise.all([
        restaurantsUsecases.listVisited({}, 'name'),
        restaurantsUsecases.listWishlist({}),
      ]);

      const foundRestaurant = [...active, ...wishlist].find((entry) => entry.id === locationId) ?? null;

      if (!foundRestaurant) {
        setRestaurant(null);
        setVisits([]);
        setError('Location not found.');
        setIsLoading(false);
        return;
      }

      const list = await visitsUsecases.listByRestaurant(foundRestaurant.id);
      const fullVisits = await Promise.all(
        list.map(async (visit) => {
          const [items, photos] = await Promise.all([
            visitsUsecases.listItemsByVisit(visit.id),
            visitsUsecases.listPhotosByVisit(visit.id),
          ]);

          return { visit, items, photos };
        }),
      );

      setRestaurant(foundRestaurant);
      setVisits(fullVisits.sort((a, b) => b.visit.visitDate.localeCompare(a.visit.visitDate)));
      setIsLoading(false);
    };

    void loadData();
  }, [locationId, restaurantsUsecases, visitsUsecases]);

  const overallRating = useMemo<Thumb | 'none'>(() => {
    if (!visits.length) return 'none';
    const score: Record<Thumb, number> = { up: 2, neutral: 1, down: 0 };
    const average = visits.reduce((total, item) => total + score[item.visit.overallThumb], 0) / visits.length;
    if (average >= 1.5) return 'up';
    if (average <= 0.5) return 'down';
    return 'neutral';
  }, [visits]);

  const viewData: LocationDetailsViewData = {
    restaurant,
    visits,
    overallRating,
    error,
    isLoading,
  };

  return { viewData };
}
