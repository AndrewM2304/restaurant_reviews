import { computeRestaurantThumb } from '@/core/domain/rating';
import type { Restaurant, RestaurantStatus, Thumb } from '@/core/domain/types';
import type { AppRepos } from '@/core/repo/interfaces';

interface ListInput {
  search?: string;
  cuisines?: string[];
}

export class RestaurantsUsecases {
  constructor(private readonly repos: AppRepos) {}

  addRestaurant(input: {
    name: string;
    cuisines: string[];
    notes?: string;
    status: RestaurantStatus;
  }): Promise<Restaurant> {
    return this.repos.restaurants.create(input);
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

  async listVisited(input: ListInput = {}): Promise<Array<Restaurant & { computedThumb: Thumb }>> {
    const restaurants = await this.repos.restaurants.list({ ...input, status: 'active' });
    return Promise.all(
      restaurants.map(async (restaurant) => {
        const visits = await this.repos.visits.listByRestaurant(restaurant.id);
        return {
          ...restaurant,
          computedThumb: computeRestaurantThumb(visits),
        };
      }),
    );
  }
}
