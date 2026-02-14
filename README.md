# Food Tracker (Next.js)

Stage 1 foundation for a local-first food tracker app with clear separation between:

- `src/app`: routes + page composition
- `src/features/*/usecases`: application logic
- `src/core/repo/interfaces.ts`: repository interfaces
- `src/features/shared/repo/local`: local persistence-backed repository implementations

## Run locally

```bash
npm install
npm run dev
```

## Current routes

- `/visited`
- `/wishlist`
- `/search`
- `/restaurants` (scaffold)
- `/visits` (scaffold)

## Deployment verification

If GitHub Pages is configured to deploy from GitHub Actions, this section should appear on the live site after the workflow completes.

## Architecture notes

- UI does not import persistence modules directly.
- Hooks instantiate use-cases via `getRepos()` dependency injection.
- `getRepos()` currently returns local repositories (`localStorage` backend).
- Restaurant thumb rating is computed from visits in `src/core/domain/rating.ts`.
