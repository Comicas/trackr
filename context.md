# MediaVault / Trackr — Context

## One-liner
Local-first tracker for Games, Anime, Movies, and Series with searchable catalogs (TMDB, AniList, IGDB) and persistent personal lists stored offline.

## Product Goals
- Search external catalogs and add items to personal lists.
- Manage per-item status (plan/watching/completed/dropped, etc.).
- Work offline-first with local persistence and backup/restore.

## Non-goals (for now)
- No online deployment requirements.
- No authentication or multi-user support.
- No remote database or server-side user storage.
- Read-only usage of external APIs (search/details only).

## Tech Stack
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- IndexedDB persistence (via `idb`)

## Core Domains
### MediaType
- `movie` | `series` | `anime` | `game`

### Status by type
- movie/series/anime: `plan` | `watching` | `completed` | `dropped`
- game: `backlog` | `playing` | `completed`

## Data Model (Normalized)
### MediaItem
Represents the static metadata about a title (from an external source).
- `id: string` (local uuid)
- `type: MediaType`
- `source: "tmdb" | "anilist" | "igdb"`
- `sourceId: string` (external id)
- `title: string`
- `year?: number`
- `coverUrl?: string`
- `rating?: number` (source rating normalized when possible)
- `meta?: Record<string, any>` (source-specific payload for future detail pages)

### ListEntry
Represents the user’s relationship to a MediaItem.
- `mediaId: string`
- `status: string` (valid values depend on MediaType)
- `progress?: number` (optional; will be expanded later)
- `notes?: string`
- `createdAt: number` (epoch ms)
- `updatedAt: number` (epoch ms)

## Persistence (Local-first)
- IndexedDB database: `trackr-db`
- Object stores:
  - `mediaItems`
  - `listEntries`
  - `settings`
- localStorage is only for tiny UI preferences (e.g., theme, last tab), not core data.
- Backup/restore:
  - Export JSON dump of all stores
  - Import JSON dump (validate version; merge safely by ids)

## Current Features (Implemented)
### UX
- Dashboard shows 4 sections: Movies, Series, Anime, Games.
- Section titles are clickable links to full list pages.
- Each section has its own small "+" button (scoped add flow).
- Adding flow:
  - Opens SearchModal scoped to that media type
  - User selects an item from results
  - User chooses status BEFORE saving
  - Saves MediaItem + ListEntry to IndexedDB

### Pages
- `/` dashboard
- `/movies` grouped by status
- `/series` grouped by status
- `/anime` grouped by status
- `/games` grouped by status
- `/storage-demo` to validate persistence + export/import

## External APIs (Implemented)
### TMDB (Movies + Series)
- Route handlers (proxy):
  - `/app/api/tmdb/search`
  - `/app/api/tmdb/details`
- Client wrapper:
  - `lib/apis/tmdb.ts`
- Notes:
  - Images require Next image remote config for `image.tmdb.org`.

### AniList (Anime)
- Search via GraphQL.
- Proxy route handler:
  - `/app/api/anilist/search`
- Client wrapper:
  - `lib/apis/anilist.ts`
- No API key required for public search queries.

### IGDB (Games) via Twitch OAuth
- Route handlers (server-only):
  - `/app/api/igdb/token` (client-credentials, token cached in-memory)
  - `/app/api/igdb/search`
- Client wrapper:
  - `lib/apis/igdb.ts`
- Must never expose Twitch client secret to the browser.

## Secrets / Env Vars
Required in `.env.local` (server-only):
- `TMDB_READ_TOKEN=...`
- `TWITCH_CLIENT_ID=...`
- `TWITCH_CLIENT_SECRET=...`

## Key Files / Structure
- Types:
  - `lib/types.ts`
- Storage:
  - `lib/storage/db.ts`
  - `lib/storage/repo.ts`
  - `lib/storage/backup.ts`
- API clients:
  - `lib/apis/tmdb.ts`
  - `lib/apis/anilist.ts`
  - `lib/apis/igdb.ts`
- UI:
  - `components/search-modal.tsx`
  - `components/cover-card.tsx`
  - `components/bento-section.tsx`
- Routes:
  - `app/api/**/route.ts`
  - `app/*/page.tsx`

## Constraints / Rules
- Never commit real secrets; `.env.local` must be gitignored.
- No client-side access to server secrets; all secret-requiring calls go through route handlers.
- Keep `MediaItem` normalized and store source-specific fields only in `meta`.
