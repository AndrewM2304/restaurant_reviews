# Supabase Setup Audit + Data Flow Notes

## Scope of this note

This document is an **exact audit of what is currently visible in this workspace** (`/workspace/restaurant_reviews`) and what can be reliably inferred from code.

I also attempted to traverse the external repo you linked:

- `https://github.com/AndrewM2304/Chatgpt_test`
- `https://github.com/AndrewM2304/Chatgpt_test/tree/main/src`

but outbound GitHub access is blocked in this runtime (CONNECT tunnel `403`), so I cannot claim exact file-level details from that remote repo in this environment.

---

## 1) Exact findings from this repo

## 1.1 There is currently no Supabase integration code

I searched for all common Supabase markers (`@supabase/supabase-js`, `createClient`, env keys, etc.) and found **no matches in app code**.

Current storage is local-only:

- `src/core/repo/container.ts` wires `getRepos()` to `createLocalRepos()`.
- `src/features/shared/repo/local/localRepos.ts` contains all repo implementations.
- `src/core/persistence/localStore.ts` reads/writes one localStorage JSON blob under key `food-tracker-local-db-v1`.

## 1.2 No Supabase keys are present in tracked files

No values for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

were found in this repository.

> Important: if you do add keys later, keep them in `.env.local` (never commit). Only `NEXT_PUBLIC_*` keys belong on the client; service-role keys must remain server-only.

---

## 2) Current data model + runtime flow (what to mirror in Supabase)

## 2.1 Domain entities

From `src/core/domain/types.ts`:

- `Restaurant`: id, name, status, cuisines[], notes, createdAt, updatedAt
- `Visit`: id, restaurantId, visitDate, serviceType, overallThumb, notes, createdAt
- `VisitItem`: id, visitId, name, thumb, notes, createdAt
- `VisitPhoto`: id, visitId, storagePath, caption, createdAt

Relationships:

- Restaurant 1→N Visits
- Visit 1→N VisitItems
- Visit 1→N VisitPhotos

## 2.2 Repository contracts

From `src/core/repo/interfaces.ts`, the application contract is already well-isolated:

- RestaurantsRepo: list/get/create/update/delete
- VisitsRepo: listByRestaurant/get/create/update/delete
- VisitItemsRepo: listByVisit/create/update/delete
- VisitPhotosRepo: listByVisit/addToVisit/delete
- SearchRepo: searchItems/searchRestaurants

Use-cases and UI are built on these interfaces, so migration is mainly implementation swap.

## 2.3 Business logic to preserve during migration

- `VisitsUsecases.addVisit()` is a multi-step write:
  1. create visit
  2. create items
  3. add photos
  4. if restaurant was `wishlist`, update status to `active`

- Restaurant listing/search computes summary fields from visits (`computedThumb`, `visitCount`, `lastVisited`, breakdown).

When moving to Supabase, keep this behavior identical (prefer transactional RPC for `addVisit`).

---

## 3) Exact Supabase setup blueprint for this codebase

This is not from the external repo; it is the direct implementation map for **this** codebase.

## 3.1 Env variables (expected)

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

If you introduce privileged operations on server routes/actions:

```bash
SUPABASE_SERVICE_ROLE_KEY=...
```

## 3.2 Minimal client module

Create `src/integrations/supabase/client.ts` with a singleton browser client using `createClient` from `@supabase/supabase-js`.

## 3.3 Swap point

Change only `src/core/repo/container.ts`:

- from `createLocalRepos()`
- to `createSupabaseRepos()`

The rest of app logic can stay stable if repo interfaces remain unchanged.

## 3.4 Suggested SQL model

Use 4 tables mirroring current domain types:

- `restaurants`
- `visits` (FK restaurant)
- `visit_items` (FK visit)
- `visit_photos` (FK visit)

Use `on delete cascade` to replace current manual cascade logic in local repo code.

---

## 4) “Any keys” checklist (what to collect from your real Supabase project)

Because no keys are present in this repo, when you wire your shared Supabase instance gather:

- Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
- Project anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) for server-only tasks
- Schema/table names
- RLS policies for each table
- Storage bucket names (if `visit_photos` will store uploaded files)

If you share those files/values structure (not secrets in chat), I can produce an exact, line-by-line migration checklist for your implementation.

---

## 5) What I tried for remote traversal

I attempted both:

- `git clone https://github.com/AndrewM2304/Chatgpt_test.git /tmp/Chatgpt_test`
- `curl -I -L https://raw.githubusercontent.com/AndrewM2304/Chatgpt_test/main/src`

Both failed in this environment with CONNECT tunnel `403`, so remote file traversal is blocked here.
