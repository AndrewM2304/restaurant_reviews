import type { Restaurant } from '@/core/domain/types';

export type TabKey = 'locations' | 'wishlist';

export interface DraftItem {
  name: string;
}

export interface DraftPhoto {
  id: string;
  storagePath: string;
  previewUrl: string;
  isLoading: boolean;
}

export interface VisitsViewData {
  tab: TabKey;
  searchQuery: string;
  showModal: boolean;
  message: string;
  locationName: string;
  visitDate: string;
  overallRating: number;
  notes: string;
  itemName: string;
  items: DraftItem[];
  photos: DraftPhoto[];
  savedLocations: Restaurant[];
  filteredLocations: Restaurant[];
  filteredWishlist: Restaurant[];
}
