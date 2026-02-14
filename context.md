# MediaVault / Trackr - Context

## Goal
Local-first tracker for Games, Anime, Movies, Series.
User manages personal lists with statuses, search/add from APIs, offline-friendly.

## Stack
- Next.js (App Router), TypeScript, Tailwind.
- UI already exists (dashboard-style homepage).

## Non-goals (for now)
- No online deployment, no auth, no remote database.
- No multi-user support.
- API integration should be read-only, just search + details.

## Domains
### MediaType
- "movie" | "series" | "anime" | "game"

### Status
- For anime/movies/series: "plan" | "watching" | "completed" | "dropped"
- For games: "backlog" | "playing" | "completed"

### Core entities
#### MediaItem (normalized)
- id: string (local uuid)
- type: MediaType
- source: "tmdb" | "anilist" | "igdb"
- sourceId: string (external id)
- title: string
- year?: number
- coverUrl?: string
- rating?: number
- meta?: object (source-specific fields)

#### ListEntry
- mediaId: string
- status: string (by media type)
- progress?: number (episodes watched / hours / etc.)
- notes?: string
- updatedAt: number (epoch ms)
- createdAt: number

## Storage (local-first)
- IndexedDB stores:
  - mediaItems
  - listEntries
  - settings
- localStorage only for tiny UI prefs (theme, last selected tab).
- Provide Export/Import JSON for backup.

## API access rules
- TMDB + IGDB keys/secrets must not be exposed to the browser:
  - Use Next.js route handlers under /app/api/* as a proxy.
- AniList can be called directly (public queries) but we can still proxy for consistency.

## Folder plan
- /lib/types.ts              (enums + interfaces)
- /lib/storage/db.ts         (indexeddb init + schema)
- /lib/storage/repo.ts       (CRUD functions)
- /lib/apis/tmdb.ts          (client wrappers)
- /lib/apis/anilist.ts       (graphql queries)
- /lib/apis/igdb.ts          (client wrappers)
- /app/api/tmdb/*            (proxy routes)
- /app/api/igdb/*            (proxy routes)
- /components/search-modal   (UI)
- /components/boards         (status columns)

## Implementation plan (next milestone)
Milestone A: Real search + add flow
- UI: Global Add button + SearchModal with tabs (Movies, Series, Anime, Games)
- Result card: title, year, cover, source badge
- On select: upsert MediaItem + create/update ListEntry with default status

Milestone B: API proxies
- /app/api/tmdb/search, /app/api/tmdb/details
  - Uses Authorization: Bearer TMDB_READ_TOKEN
- /app/api/anilist/search (optional but preferred)
  - POST https://graphql.anilist.co with query+variables
- /app/api/igdb/token + /app/api/igdb/search
  - Server-only OAuth client-credentials flow, cache token
