import type {
  Restaurant,
  RestaurantStatus,
  SearchItemResult,
  ServiceType,
  Thumb,
  Visit,
  VisitItem,
  VisitPhoto,
} from '@/core/domain/types';

export interface RestaurantsListFilters {
  status?: RestaurantStatus;
  search?: string;
  cuisines?: string[];
}

export interface RestaurantsRepo {
  list(filters?: RestaurantsListFilters): Promise<Restaurant[]>;
  get(id: string): Promise<Restaurant | null>;
  create(input: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Restaurant>;
  update(id: string, patch: Partial<Omit<Restaurant, 'id' | 'createdAt'>>): Promise<Restaurant>;
  delete(id: string): Promise<void>;
}

export interface VisitsRepo {
  listByRestaurant(restaurantId: string): Promise<Visit[]>;
  get(id: string): Promise<Visit | null>;
  create(input: Omit<Visit, 'id' | 'createdAt'>): Promise<Visit>;
  update(id: string, patch: Partial<Omit<Visit, 'id' | 'restaurantId' | 'createdAt'>>): Promise<Visit>;
  delete(id: string): Promise<void>;
}

export interface VisitItemsRepo {
  listByVisit(visitId: string): Promise<VisitItem[]>;
  create(input: Omit<VisitItem, 'id' | 'createdAt'>): Promise<VisitItem>;
  update(id: string, patch: Partial<Omit<VisitItem, 'id' | 'visitId' | 'createdAt'>>): Promise<VisitItem>;
  delete(id: string): Promise<void>;
}

export interface VisitPhotosRepo {
  listByVisit(visitId: string): Promise<VisitPhoto[]>;
  addToVisit(visitId: string, fileOrRef: string, caption?: string): Promise<VisitPhoto>;
  delete(id: string): Promise<void>;
}

export interface SearchFilters {
  thumbs?: Thumb[];
  cuisines?: string[];
  serviceTypes?: ServiceType[];
  fromDate?: string;
  toDate?: string;
}

export interface SearchRepo {
  searchItems(query: string, filters?: SearchFilters): Promise<SearchItemResult[]>;
  searchRestaurants(query: string, filters?: RestaurantsListFilters): Promise<Restaurant[]>;
}

export interface AppRepos {
  restaurants: RestaurantsRepo;
  visits: VisitsRepo;
  visitItems: VisitItemsRepo;
  visitPhotos: VisitPhotosRepo;
  search: SearchRepo;
}
