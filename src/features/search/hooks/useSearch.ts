'use client';

import { useMemo } from 'react';

import { getRepos } from '@/core/repo/container';
import { SearchUsecases } from '@/features/search/usecases/searchUsecases';

export function useSearch() {
  return useMemo(() => new SearchUsecases(getRepos()), []);
}
