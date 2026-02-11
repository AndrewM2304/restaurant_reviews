import type { Restaurant, SearchItemResult, Visit, VisitItem, VisitPhoto } from '@/core/domain/types';
import type { AppRepos, RestaurantsListFilters, RestaurantsRepo, SearchFilters, SearchRepo, VisitItemsRepo, VisitPhotosRepo, VisitsRepo } from '@/core/repo/interfaces';
import { createId, loadDb, saveDb } from '@/core/persistence/localStore';

function nowIso(): string {
  return new Date().toISOString();
}

class LocalRestaurantsRepo implements RestaurantsRepo {
  async list(filters: RestaurantsListFilters = {}): Promise<Restaurant[]> {
    const db = loadDb();
    return db.restaurants.filter((restaurant) => {
      if (filters.status && restaurant.status !== filters.status) return false;
      if (
        filters.search &&
        !restaurant.name.toLowerCase().includes(filters.search.toLowerCase().trim())
      )
        return false;
      if (filters.cuisines?.length) {
        const cuisineSet = new Set(restaurant.cuisines.map((cuisine) => cuisine.toLowerCase()));
        const hasAny = filters.cuisines.some((cuisine) => cuisineSet.has(cuisine.toLowerCase()));
        if (!hasAny) return false;
      }
      return true;
    });
  }

  async get(id: string): Promise<Restaurant | null> {
    return loadDb().restaurants.find((restaurant) => restaurant.id === id) ?? null;
  }

  async create(input: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Restaurant> {
    const db = loadDb();
    const createdAt = nowIso();
    const restaurant: Restaurant = {
      ...input,
      id: createId('rest'),
      createdAt,
      updatedAt: createdAt,
    };
    db.restaurants.unshift(restaurant);
    saveDb(db);
    return restaurant;
  }

  async update(id: string, patch: Partial<Omit<Restaurant, 'id' | 'createdAt'>>): Promise<Restaurant> {
    const db = loadDb();
    const idx = db.restaurants.findIndex((restaurant) => restaurant.id === id);
    if (idx < 0) throw new Error(`Restaurant not found: ${id}`);
    db.restaurants[idx] = { ...db.restaurants[idx], ...patch, updatedAt: nowIso() };
    saveDb(db);
    return db.restaurants[idx];
  }

  async delete(id: string): Promise<void> {
    const db = loadDb();
    const visitIds = db.visits.filter((visit) => visit.restaurantId === id).map((visit) => visit.id);
    db.restaurants = db.restaurants.filter((restaurant) => restaurant.id !== id);
    db.visits = db.visits.filter((visit) => visit.restaurantId !== id);
    db.visitItems = db.visitItems.filter((item) => !visitIds.includes(item.visitId));
    db.visitPhotos = db.visitPhotos.filter((photo) => !visitIds.includes(photo.visitId));
    saveDb(db);
  }
}

class LocalVisitsRepo implements VisitsRepo {
  async listByRestaurant(restaurantId: string): Promise<Visit[]> {
    return loadDb().visits.filter((visit) => visit.restaurantId === restaurantId);
  }

  async get(id: string): Promise<Visit | null> {
    return loadDb().visits.find((visit) => visit.id === id) ?? null;
  }

  async create(input: Omit<Visit, 'id' | 'createdAt'>): Promise<Visit> {
    const db = loadDb();
    const visit: Visit = { ...input, id: createId('visit'), createdAt: nowIso() };
    db.visits.unshift(visit);
    saveDb(db);
    return visit;
  }

  async update(id: string, patch: Partial<Omit<Visit, 'id' | 'restaurantId' | 'createdAt'>>): Promise<Visit> {
    const db = loadDb();
    const idx = db.visits.findIndex((visit) => visit.id === id);
    if (idx < 0) throw new Error(`Visit not found: ${id}`);
    db.visits[idx] = { ...db.visits[idx], ...patch };
    saveDb(db);
    return db.visits[idx];
  }

  async delete(id: string): Promise<void> {
    const db = loadDb();
    db.visits = db.visits.filter((visit) => visit.id !== id);
    db.visitItems = db.visitItems.filter((item) => item.visitId !== id);
    db.visitPhotos = db.visitPhotos.filter((photo) => photo.visitId !== id);
    saveDb(db);
  }
}

class LocalVisitItemsRepo implements VisitItemsRepo {
  async listByVisit(visitId: string): Promise<VisitItem[]> {
    return loadDb().visitItems.filter((item) => item.visitId === visitId);
  }

  async create(input: Omit<VisitItem, 'id' | 'createdAt'>): Promise<VisitItem> {
    const db = loadDb();
    const item: VisitItem = { ...input, id: createId('item'), createdAt: nowIso() };
    db.visitItems.push(item);
    saveDb(db);
    return item;
  }

  async update(id: string, patch: Partial<Omit<VisitItem, 'id' | 'visitId' | 'createdAt'>>): Promise<VisitItem> {
    const db = loadDb();
    const idx = db.visitItems.findIndex((item) => item.id === id);
    if (idx < 0) throw new Error(`Visit item not found: ${id}`);
    db.visitItems[idx] = { ...db.visitItems[idx], ...patch };
    saveDb(db);
    return db.visitItems[idx];
  }

  async delete(id: string): Promise<void> {
    const db = loadDb();
    db.visitItems = db.visitItems.filter((item) => item.id !== id);
    saveDb(db);
  }
}

class LocalVisitPhotosRepo implements VisitPhotosRepo {
  async listByVisit(visitId: string): Promise<VisitPhoto[]> {
    return loadDb().visitPhotos.filter((photo) => photo.visitId === visitId);
  }

  async addToVisit(visitId: string, fileOrRef: string, caption?: string): Promise<VisitPhoto> {
    const db = loadDb();
    const photo: VisitPhoto = {
      id: createId('photo'),
      visitId,
      storagePath: fileOrRef,
      caption,
      createdAt: nowIso(),
    };
    db.visitPhotos.push(photo);
    saveDb(db);
    return photo;
  }

  async delete(id: string): Promise<void> {
    const db = loadDb();
    db.visitPhotos = db.visitPhotos.filter((photo) => photo.id !== id);
    saveDb(db);
  }
}

class LocalSearchRepo implements SearchRepo {
  constructor(
    private readonly restaurantsRepo: RestaurantsRepo,
    private readonly visitsRepo: VisitsRepo,
    private readonly visitItemsRepo: VisitItemsRepo,
  ) {}

  async searchItems(query: string, filters: SearchFilters = {}): Promise<SearchItemResult[]> {
    const db = loadDb();
    const q = query.toLowerCase().trim();
    const restaurants = await this.restaurantsRepo.list({ cuisines: filters.cuisines });
    const restaurantMap = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));

    return db.visitItems
      .filter((item) => item.name.toLowerCase().includes(q))
      .map((item) => {
        const visit = db.visits.find((candidate) => candidate.id === item.visitId);
        if (!visit) return null;
        const restaurant = restaurantMap.get(visit.restaurantId);
        if (!restaurant) return null;
        if (filters.thumbs?.length && !filters.thumbs.includes(item.thumb)) return null;
        if (filters.serviceTypes?.length && !filters.serviceTypes.includes(visit.serviceType)) return null;
        if (filters.fromDate && visit.visitDate < filters.fromDate) return null;
        if (filters.toDate && visit.visitDate > filters.toDate) return null;

        return { item, visit, restaurant };
      })
      .filter((result): result is SearchItemResult => Boolean(result));
  }

  async searchRestaurants(query: string, filters: RestaurantsListFilters = {}): Promise<Restaurant[]> {
    return this.restaurantsRepo.list({ ...filters, search: query });
  }
}

let singleton: AppRepos | null = null;

export function createLocalRepos(): AppRepos {
  if (singleton) {
    return singleton;
  }
  const restaurants = new LocalRestaurantsRepo();
  const visits = new LocalVisitsRepo();
  const visitItems = new LocalVisitItemsRepo();
  const visitPhotos = new LocalVisitPhotosRepo();
  const search = new LocalSearchRepo(restaurants, visits, visitItems);
  singleton = { restaurants, visits, visitItems, visitPhotos, search };
  return singleton;
}
