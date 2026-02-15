# MediaVault / Trackr — Context

## One-liner
Local-first tracker for Games, Anime, Movies, and Series with searchable catalogs (TMDB, AniList, IGDB) and persistent personal lists stored offline (IndexedDB).

## Product Goals
- Search external catalogs and add items to personal lists.
- Manage per-item statuses (plan/watching/completed/dropped, etc.) and personal metadata (notes/ratings).
- Offline-first: data persists locally with export/import backup.

## Non-goals (for now)
- No authentication or multi-user.
- No remote database / server-side user storage.
- External APIs are used read-only (search/details), no user list sync.

## Tech Stack
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui components
- IndexedDB persistence via `idb`

## Core Domains

### MediaType
- `movie` | `series` | `anime` | `game`

### Status by type
- movie/series/anime: `plan` | `watching` | `completed` | `dropped`
- game: `backlog` | `playing` | `completed`

## Data Model (Normalized)

### MediaItem (catalog metadata)
Represents static metadata (from external source).
- `id: string` (local uuid)
- `type: MediaType`
- `source: "tmdb" | "anilist" | "igdb"`
- `sourceId: string`
- `title: string`
- `year?: number`
- `coverUrl?: string`
- `rating?: number` (external/source rating normalized when possible)
- `meta?: Record<string, any>` (source-specific payload; for AniList includes seasonal fields)

### ListEntry (user list data)
Represents the user’s relationship to a MediaItem.
- `mediaId: string`
- `status: string` (valid values depend on MediaType)
- `progress?: number` (exists but not yet fully implemented per-type)
- `notes?: string`
- `userRating?: number` (personal rating, intended 0–10 integers)
- `createdAt: number` (epoch ms)
- `updatedAt: number` (epoch ms)

## Persistence (Local-first)
- IndexedDB database: `trackr-db`
- Object stores:
  - `mediaItems`
  - `listEntries`
  - `settings`
- localStorage only for tiny UI prefs (theme, last tab).
- Backup/restore:
  - Export JSON dump of all stores
  - Import JSON dump (validate version; merge safely by ids)

## Repo / Data Layer (Key Capabilities)
- CRUD:
  - `upsertMediaItem`
  - `setEntryStatus`
  - `updateEntry`
  - `removeEntry`
- Aggregations:
  - Completed-only counts are used for dashboard stats bar.
- Change notifications:
  - Repo emits "db changed" and UI subscribes to refresh (real-time updates in the same tab).
- Homepage helpers:
  - `getHomeSection(type, limit, primaryStatuses, fallbackStatuses)` returns joined `{ media, entry }[]`, prioritizes active statuses first, sorted by `updatedAt DESC`.
  - `getHomeAnimeSections()` returns `{ thisSeason, main }` where:
    - `thisSeason`: anime with entry.status=watching AND meta.status=RELEASING AND meta.seasonYear=currentYear AND meta.season=currentSeason
    - `main`: watching (non-seasonal) then completed, limited (e.g., 4)

## Current Features (Implemented)

### Dashboard (Homepage)
- No hardcoded arrays: all sections load dynamically from IndexedDB.
- Prioritization per section:
  - Movies: watching -> completed (recent)
  - Series: watching -> completed (recent), limited (e.g., 4)
  - Games: playing -> completed (recent), limited (e.g., 3)
  - Anime:
    - Main row: watching (non-seasonal) -> completed
    - Subsection "This season": watching + currently airing this season
- No placeholders: only render cards for items that exist.
- Real-time refresh: homepage re-renders when repo emits changes.
- Stats bar in the middle updates in real-time and reflects COMPLETED counts only (by type).

### Status Indicators (Cards)
- StatusDot component exists and is rendered on cards (CoverCard / MiniCoverCard / GameBanner).
- Color mapping intent:
  - completed: blue
  - watching/playing: green
  - plan/backlog: gray
  - dropped: red
- Dot visibility/size is being iterated (needs to be perceptible across statuses).

### Pages
- `/` dashboard
- `/movies`, `/series`, `/anime`, `/games` list pages grouped by status
- `/storage-demo` validates persistence + export/import

### Search & Add Flow
- Each dashboard section has its own "+" button (scoped add).
- SearchModal supports:
  - `initialType` / `allowedTypes`
  - debounced search
  - adding from results into IndexedDB
  - status selection before saving
- UX is being iterated to make status selection inline on "+" click (no extra step screen).

## External APIs (Implemented)

### TMDB (Movies + Series)
- Server proxy routes:
  - `/app/api/tmdb/search`
  - `/app/api/tmdb/details`
- Client wrapper:
  - `lib/apis/tmdb.ts`
- Next image remote config allows `image.tmdb.org`.
- Auth uses Bearer token (TMDB read access token).

### AniList (Anime)
- Search via GraphQL.
- Proxy route:
  - `/app/api/anilist/search`
- Client wrapper:
  - `lib/apis/anilist.ts`
- Normalization stores seasonal fields in `MediaItem.meta`:
  - `meta.season` (WINTER/SPRING/SUMMER/FALL)
  - `meta.seasonYear`
  - `meta.status` (e.g., RELEASING)

### IGDB (Games) via Twitch OAuth
- Server-only routes:
  - `/app/api/igdb/token` (client credentials; caches token)
  - `/app/api/igdb/search`
- Client wrapper:
  - `lib/apis/igdb.ts`
- Must never expose Twitch client secret to client code.

## Secrets / Env Vars
Required in `.env.local` (server-only):
- `TMDB_READ_TOKEN=...`
- `TWITCH_CLIENT_ID=...`
- `TWITCH_CLIENT_SECRET=...`

## Key Files / Structure (high-level)
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
  - `components/mini-cover-card.tsx`
  - `components/game-banner.tsx`
  - `components/bento-section.tsx`
  - `components/status-dot.tsx`
  - `components/stats-bar.tsx` (completed-only counts)
- Routes:
  - `app/api/**/route.ts`
  - `app/*/page.tsx`

## Constraints / Rules
- Never commit real secrets; `.env.local` must be gitignored. (Use `.env.example` for placeholders.) [web:92][web:343]
- No client-side access to secrets; any secret-requiring API calls go through route handlers.
- Keep `MediaItem` normalized; source-specific fields go into `meta`.
- AniList seasonal logic relies on `Media` fields like `season`, `seasonYear`, `status` stored in `meta`. [web:305]
- IGDB auth uses Twitch client credentials flow (server-to-server). [web:36]

