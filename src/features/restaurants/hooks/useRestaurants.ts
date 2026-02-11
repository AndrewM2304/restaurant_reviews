'use client';

import { useMemo } from 'react';

import { getRepos } from '@/core/repo/container';
import { RestaurantsUsecases } from '@/features/restaurants/usecases/restaurantsUsecases';

export function useRestaurants() {
  return useMemo(() => new RestaurantsUsecases(getRepos()), []);
}
