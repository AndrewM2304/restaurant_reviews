import type { SearchItemResult } from '@/core/domain/types';
import type { AppRepos } from '@/core/repo/interfaces';

export class SearchUsecases {
  constructor(private readonly repos: AppRepos) {}

  searchRestaurants(query: string) {
    return this.repos.search.searchRestaurants(query);
  }

  searchItems(query: string): Promise<SearchItemResult[]> {
    return this.repos.search.searchItems(query);
  }
}
