import type { AppRepos } from '@/core/repo/interfaces';
import { createLocalRepos } from '@/features/shared/repo/local/localRepos';

export function getRepos(): AppRepos {
  return createLocalRepos();
}
