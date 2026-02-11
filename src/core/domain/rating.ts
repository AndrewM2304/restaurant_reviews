import type { Thumb, Visit } from '@/core/domain/types';

const SCORE_BY_THUMB: Record<Thumb, number> = {
  up: 1,
  neutral: 0,
  down: -1,
};

export interface RatingThresholds {
  upMin: number;
  downMax: number;
}

const DEFAULT_THRESHOLDS: RatingThresholds = {
  upMin: 0.33,
  downMax: -0.33,
};

export function computeRestaurantThumb(
  visits: Visit[],
  thresholds: RatingThresholds = DEFAULT_THRESHOLDS,
): Thumb {
  if (!visits.length) {
    return 'neutral';
  }

  const average =
    visits.reduce((sum, visit) => sum + SCORE_BY_THUMB[visit.overallThumb], 0) /
    visits.length;

  if (average > thresholds.upMin) {
    return 'up';
  }

  if (average < thresholds.downMax) {
    return 'down';
  }

  return 'neutral';
}
