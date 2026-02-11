import { computeRestaurantThumb } from '@/core/domain/rating';
import type { RestaurantStatus, SearchItemResult, Thumb } from '@/core/domain/types';
import type { AppRepos, SearchFilters } from '@/core/repo/interfaces';

export interface RestaurantSearchFilters {
  cuisines?: string[];
  status?: RestaurantStatus;
  thumbs?: Thumb[];
}

export class SearchUsecases {
  constructor(private readonly repos: AppRepos) {}

  async searchRestaurants(query: string, filters: RestaurantSearchFilters = {}) {
    const restaurants = await this.repos.search.searchRestaurants(query, {
      cuisines: filters.cuisines,
      status: filters.status,
    });

    const withComputed = await Promise.all(
      restaurants.map(async (restaurant) => {
        const visits = await this.repos.visits.listByRestaurant(restaurant.id);
        return {
          ...restaurant,
          computedThumb: computeRestaurantThumb(visits),
          lastVisited: visits.map((visit) => visit.visitDate).sort((a, b) => b.localeCompare(a))[0],
        };
      }),
    );

    if (!filters.thumbs?.length) {
      return withComputed;
    }

    return withComputed.filter((restaurant) => filters.thumbs!.includes(restaurant.computedThumb));
  }

  searchItems(query: string, filters: SearchFilters = {}): Promise<SearchItemResult[]> {
    return this.repos.search.searchItems(query, filters);
  }
}
