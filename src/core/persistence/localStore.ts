import type { Restaurant, Visit, VisitItem, VisitPhoto } from '@/core/domain/types';

interface LocalDb {
  restaurants: Restaurant[];
  visits: Visit[];
  visitItems: VisitItem[];
  visitPhotos: VisitPhoto[];
}

const KEY = 'food-tracker-local-db-v1';

const emptyDb: LocalDb = {
  restaurants: [],
  visits: [],
  visitItems: [],
  visitPhotos: [],
};

export function loadDb(): LocalDb {
  if (typeof window === 'undefined') {
    return structuredClone(emptyDb);
  }

  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    return structuredClone(emptyDb);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LocalDb>;
    return {
      restaurants: parsed.restaurants ?? [],
      visits: parsed.visits ?? [],
      visitItems: parsed.visitItems ?? [],
      visitPhotos: parsed.visitPhotos ?? [],
    };
  } catch {
    return structuredClone(emptyDb);
  }
}

export function saveDb(db: LocalDb): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(KEY, JSON.stringify(db));
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
