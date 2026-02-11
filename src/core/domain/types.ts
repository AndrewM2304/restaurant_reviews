export type Thumb = 'down' | 'neutral' | 'up';

export type RestaurantStatus = 'wishlist' | 'active' | 'archived';

export type ServiceType = 'eat_in' | 'takeaway' | 'delivery';

export interface Restaurant {
  id: string;
  name: string;
  status: RestaurantStatus;
  cuisines: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  restaurantId: string;
  visitDate: string;
  serviceType: ServiceType;
  overallThumb: Thumb;
  notes?: string;
  createdAt: string;
}

export interface VisitItem {
  id: string;
  visitId: string;
  name: string;
  thumb: Thumb;
  notes?: string;
  createdAt: string;
}

export interface VisitPhoto {
  id: string;
  visitId: string;
  storagePath: string;
  caption?: string;
  createdAt: string;
}

export interface SearchItemResult {
  item: VisitItem;
  visit: Visit;
  restaurant: Restaurant;
}
