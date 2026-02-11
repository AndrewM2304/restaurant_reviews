import { computeRestaurantThumb } from '@/core/domain/rating';
import type { Restaurant, RestaurantStatus, ServiceType, Thumb } from '@/core/domain/types';
import type { AppRepos } from '@/core/repo/interfaces';

interface ListInput {
  search?: string;
  cuisines?: string[];
}

export interface VisitedFilters extends ListInput {
  thumbs?: Thumb[];
  serviceTypes?: ServiceType[];
  fromDate?: string;
  toDate?: string;
}

export type VisitedSort = 'rating' | 'most_visited' | 'recently_visited' | 'name';

export interface RestaurantComputedSummary {
  computedThumb: Thumb;
  visitCount: number;
  lastVisited?: string;
  thumbsBreakdown: Record<Thumb, number>;
}

export type VisitedRestaurant = Restaurant & RestaurantComputedSummary;

export class RestaurantsUsecases {
  constructor(private readonly repos: AppRepos) {}

  addRestaurant(input: {
    name: string;
    cuisines: string[];
    notes?: string;
    status?: RestaurantStatus;
  }): Promise<Restaurant> {
    return this.repos.restaurants.create({ ...input, status: input.status ?? 'wishlist' });
  }

  updateRestaurant(id: string, patch: Partial<Omit<Restaurant, 'id' | 'createdAt'>>): Promise<Restaurant> {
    return this.repos.restaurants.update(id, patch);
  }

  setRestaurantStatus(id: string, status: RestaurantStatus): Promise<Restaurant> {
    return this.repos.restaurants.update(id, { status });
  }

  listWishlist(input: ListInput = {}): Promise<Restaurant[]> {
    return this.repos.restaurants.list({ ...input, status: 'wishlist' });
  }

  async listVisited(input: VisitedFilters = {}, sortBy: VisitedSort = 'recently_visited'): Promise<VisitedRestaurant[]> {
    const restaurants = await this.repos.restaurants.list({
      status: 'active',
      search: input.search,
      cuisines: input.cuisines,
    });

    const withSummaries = (
      await Promise.all(
        restaurants.map(async (restaurant) => {
          const visits = await this.repos.visits.listByRestaurant(restaurant.id);
          const computedThumb = computeRestaurantThumb(visits);
          const visitCount = visits.length;
          const lastVisited = visits
            .map((visit) => visit.visitDate)
            .sort((a, b) => b.localeCompare(a))[0];
          const thumbsBreakdown = {
            up: visits.filter((visit) => visit.overallThumb === 'up').length,
            neutral: visits.filter((visit) => visit.overallThumb === 'neutral').length,
            down: visits.filter((visit) => visit.overallThumb === 'down').length,
          };

          return {
            ...restaurant,
            computedThumb,
            visitCount,
            lastVisited,
            thumbsBreakdown,
            visits,
          };
        }),
      )
    )
      .filter((restaurant) => {
        if (input.thumbs?.length && !input.thumbs.includes(restaurant.computedThumb)) {
          return false;
        }

        if (input.fromDate && !restaurant.visits.some((visit) => visit.visitDate >= input.fromDate!)) {
          return false;
        }

        if (input.toDate && !restaurant.visits.some((visit) => visit.visitDate <= input.toDate!)) {
          return false;
        }

        if (
          input.serviceTypes?.length &&
          !restaurant.visits.some((visit) => input.serviceTypes!.includes(visit.serviceType))
        ) {
          return false;
        }

        return true;
      })
      .map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        status: restaurant.status,
        cuisines: restaurant.cuisines,
        notes: restaurant.notes,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt,
        computedThumb: restaurant.computedThumb,
        visitCount: restaurant.visitCount,
        lastVisited: restaurant.lastVisited,
        thumbsBreakdown: restaurant.thumbsBreakdown,
      }));

    return withSummaries.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'most_visited') return b.visitCount - a.visitCount;
      if (sortBy === 'rating') {
        const score: Record<Thumb, number> = { up: 2, neutral: 1, down: 0 };
        return score[b.computedThumb] - score[a.computedThumb] || b.visitCount - a.visitCount;
      }

      return (b.lastVisited ?? '').localeCompare(a.lastVisited ?? '');
    });
  }
}
