import type { ServiceType, Thumb, Visit } from '@/core/domain/types';
import type { AppRepos } from '@/core/repo/interfaces';

export class VisitsUsecases {
  constructor(private readonly repos: AppRepos) {}

  async addVisit(input: {
    restaurantId: string;
    visitDate: string;
    serviceType: ServiceType;
    overallThumb: Thumb;
    notes?: string;
  }): Promise<Visit> {
    const visit = await this.repos.visits.create(input);
    const restaurant = await this.repos.restaurants.get(input.restaurantId);
    if (restaurant && restaurant.status === 'wishlist') {
      await this.repos.restaurants.update(restaurant.id, { status: 'active' });
    }
    return visit;
  }

  updateVisit(id: string, patch: Partial<Omit<Visit, 'id' | 'restaurantId' | 'createdAt'>>): Promise<Visit> {
    return this.repos.visits.update(id, patch);
  }

  deleteVisit(id: string): Promise<void> {
    return this.repos.visits.delete(id);
  }

  listByRestaurant(restaurantId: string): Promise<Visit[]> {
    return this.repos.visits.listByRestaurant(restaurantId);
  }
}
