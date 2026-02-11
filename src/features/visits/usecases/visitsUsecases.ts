import type { ServiceType, Thumb, Visit, VisitItem, VisitPhoto } from '@/core/domain/types';
import type { AppRepos } from '@/core/repo/interfaces';

export class VisitsUsecases {
  constructor(private readonly repos: AppRepos) {}

  async addVisit(input: {
    restaurantId: string;
    visitDate: string;
    serviceType: ServiceType;
    overallThumb: Thumb;
    notes?: string;
    items?: Array<Pick<VisitItem, 'name' | 'thumb' | 'notes'>>;
    photos?: Array<{ storagePath: string; caption?: string }>;
  }): Promise<Visit> {
    if (!input.visitDate || !input.serviceType || !input.overallThumb) {
      throw new Error('Visit date, service type and overall thumb are required.');
    }

    const visit = await this.repos.visits.create({
      restaurantId: input.restaurantId,
      visitDate: input.visitDate,
      serviceType: input.serviceType,
      overallThumb: input.overallThumb,
      notes: input.notes,
    });

    for (const item of input.items ?? []) {
      if (!item.name.trim()) continue;
      await this.repos.visitItems.create({
        visitId: visit.id,
        name: item.name.trim(),
        thumb: item.thumb,
        notes: item.notes,
      });
    }

    for (const photo of input.photos ?? []) {
      if (!photo.storagePath.trim()) continue;
      await this.repos.visitPhotos.addToVisit(visit.id, photo.storagePath.trim(), photo.caption);
    }

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

  listItemsByVisit(visitId: string): Promise<VisitItem[]> {
    return this.repos.visitItems.listByVisit(visitId);
  }

  updateItem(id: string, patch: Partial<Omit<VisitItem, 'id' | 'visitId' | 'createdAt'>>): Promise<VisitItem> {
    return this.repos.visitItems.update(id, patch);
  }

  deleteItem(id: string): Promise<void> {
    return this.repos.visitItems.delete(id);
  }

  listPhotosByVisit(visitId: string): Promise<VisitPhoto[]> {
    return this.repos.visitPhotos.listByVisit(visitId);
  }

  addPhotoToVisit(visitId: string, storagePath: string, caption?: string): Promise<VisitPhoto> {
    return this.repos.visitPhotos.addToVisit(visitId, storagePath, caption);
  }

  deletePhoto(id: string): Promise<void> {
    return this.repos.visitPhotos.delete(id);
  }
}
