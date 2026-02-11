'use client';

import { useMemo } from 'react';

import { getRepos } from '@/core/repo/container';
import { VisitsUsecases } from '@/features/visits/usecases/visitsUsecases';

export function useVisits() {
  return useMemo(() => new VisitsUsecases(getRepos()), []);
}
