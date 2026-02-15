import { getDB } from './db';
import { MediaItem, ListEntry, MediaStatus, MediaType, MediaItemWithEntry } from '@/lib/types';

type ChangeListener = () => void;
const listeners: ChangeListener[] = [];

function notifyListeners() {
    listeners.forEach(l => l());
}

export const repo = {
    subscribe(listener: ChangeListener) {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    },

    async upsertMediaItem(item: MediaItem) {
        const db = await getDB();
        await db.put('mediaItems', item);
        notifyListeners();
    },

    async setEntryStatus(mediaId: string, status: MediaStatus) {
        const db = await getDB();
        const existingEntry = await db.get('listEntries', mediaId);

        const entry: ListEntry = {
            mediaId,
            status,
            createdAt: existingEntry ? existingEntry.createdAt : Date.now(),
            updatedAt: Date.now(),
            notes: existingEntry?.notes,
            progress: existingEntry?.progress,
        };

        await db.put('listEntries', entry);
        notifyListeners();
    },

    async updateEntry(mediaId: string, patch: Partial<ListEntry>) {
        const db = await getDB();
        const existingEntry = await db.get('listEntries', mediaId);

        if (!existingEntry) {
            throw new Error(`Entry for media ${mediaId} not found`);
        }

        const updatedEntry: ListEntry = {
            ...existingEntry,
            ...patch,
            updatedAt: Date.now(),
        };

        await db.put('listEntries', updatedEntry);
        notifyListeners();
    },

    async removeEntry(mediaId: string) {
        const db = await getDB();
        await db.delete('listEntries', mediaId);
        notifyListeners();
    },

    async getMediaItem(id: string): Promise<MediaItem | undefined> {
        const db = await getDB();
        return db.get('mediaItems', id);
    },

    async getEntry(mediaId: string): Promise<ListEntry | undefined> {
        const db = await getDB();
        return db.get('listEntries', mediaId);
    },

    async listEntriesByTypeAndStatus(type: MediaType, status?: MediaStatus): Promise<MediaItemWithEntry[]> {
        const db = await getDB();

        // Get all media items of the specified type
        // This is more efficient if we have an index on type, which we do
        const mediaItems = await db.getAllFromIndex('mediaItems', 'by-type', type);

        // Get all entries
        // Optimisation: if status is provided, we could use the index on status
        // But since we need to join with media items, it might be better to get relevant entries
        // or just get all entries and filter in memory if the dataset is small (local-first usually is)

        const results: MediaItemWithEntry[] = [];

        for (const item of mediaItems) {
            const entry = await db.get('listEntries', item.id);

            if (entry) {
                if (!status || entry.status === status) {
                    results.push({ ...item, entry });
                }
            }
        }

        return results;
    },

    async getAllMediaWithEntries(): Promise<MediaItemWithEntry[]> {
        const db = await getDB();
        const entries = await db.getAll('listEntries');
        const results: MediaItemWithEntry[] = [];

        for (const entry of entries) {
            const item = await db.get('mediaItems', entry.mediaId);
            if (item) {
                results.push({ ...item, entry });
            }
        }
        return results;
    },

    async getDashboardCounts() {
        const db = await getDB();
        const entries = await db.getAll('listEntries');

        // Initialize counts
        const counts: Record<string, Record<string, number>> = {
            movie: {}, series: {}, anime: {}, game: {}
        };

        // Helper to safety increment
        const increment = (type: string, status: string) => {
            if (!counts[type]) counts[type] = {};
            if (!counts[type][status]) counts[type][status] = 0;
            counts[type][status]++;
        };

        for (const entry of entries) {
            const item = await db.get('mediaItems', entry.mediaId);
            if (item) {
                increment(item.type, entry.status);
            }
        }

        return counts;
    },

    async getCompletedCounts() {
        const db = await getDB();
        const entries = await db.getAll('listEntries');

        const counts = {
            anime: 0,
            games: 0,
            movies: 0,
            series: 0
        };

        for (const entry of entries) {
            if (entry.status === 'completed') {
                const item = await db.get('mediaItems', entry.mediaId);
                if (item) {
                    if (item.type === 'anime') counts.anime++;
                    else if (item.type === 'game') counts.games++;
                    else if (item.type === 'movie') counts.movies++;
                    else if (item.type === 'series') counts.series++;
                }
            }
        }

        return counts;
    },

    async getHomeSection(
        type: MediaType,
        limit: number,
        primaryStatuses: MediaStatus[],
        fallbackStatuses: MediaStatus[]
    ): Promise<Array<{ media: MediaItem; entry: ListEntry }>> {
        const db = await getDB();
        const mediaItems = await db.getAllFromIndex('mediaItems', 'by-type', type);

        // Collect entries with media
        const itemsWithEntries: Array<{ media: MediaItem; entry: ListEntry }> = [];

        for (const media of mediaItems) {
            const entry = await db.get('listEntries', media.id);
            if (entry) {
                itemsWithEntries.push({ media, entry });
            }
        }

        // Separate by primary and fallback statuses
        const primaryItems = itemsWithEntries
            .filter(item => primaryStatuses.includes(item.entry.status))
            .sort((a, b) => b.entry.updatedAt - a.entry.updatedAt);

        const fallbackItems = itemsWithEntries
            .filter(item => fallbackStatuses.includes(item.entry.status))
            .sort((a, b) => b.entry.updatedAt - a.entry.updatedAt);

        // Combine: primary first, then fallback, capped at limit
        const result = [...primaryItems];
        const remaining = limit - result.length;

        if (remaining > 0) {
            result.push(...fallbackItems.slice(0, remaining));
        }

        return result.slice(0, limit);
    },

    async getHomeAnimeSections(): Promise<{
        thisSeason: Array<{ media: MediaItem; entry: ListEntry }>;
        main: Array<{ media: MediaItem; entry: ListEntry }>;
    }> {
        const db = await getDB();
        const animeItems = await db.getAllFromIndex('mediaItems', 'by-type', 'anime');

        // Calculate current season
        const now = new Date();
        const currentYear = now.getFullYear();
        const month = now.getMonth() + 1; // 1-12
        let currentSeason: string;

        if (month >= 1 && month <= 3) {
            currentSeason = 'WINTER';
        } else if (month >= 4 && month <= 6) {
            currentSeason = 'SPRING';
        } else if (month >= 7 && month <= 9) {
            currentSeason = 'SUMMER';
        } else {
            currentSeason = 'FALL';
        }

        // Collect all anime with entries
        const itemsWithEntries: Array<{ media: MediaItem; entry: ListEntry }> = [];

        for (const media of animeItems) {
            const entry = await db.get('listEntries', media.id);
            if (entry) {
                itemsWithEntries.push({ media, entry });
            }
        }

        // Filter "This Season": watching + RELEASING + current season/year
        const thisSeason = itemsWithEntries
            .filter(item => {
                const { entry, media } = item;
                return (
                    entry.status === 'watching' &&
                    media.meta?.status === 'RELEASING' &&
                    media.meta?.seasonYear === currentYear &&
                    media.meta?.season === currentSeason
                );
            })
            .sort((a, b) => b.entry.updatedAt - a.entry.updatedAt);

        // Get IDs of "This Season" items to exclude from main
        const thisSeasonIds = new Set(thisSeason.map(item => item.media.id));

        // Main anime: watching (not in thisSeason) first, then completed
        const watching = itemsWithEntries
            .filter(item => item.entry.status === 'watching' && !thisSeasonIds.has(item.media.id))
            .sort((a, b) => b.entry.updatedAt - a.entry.updatedAt);

        const completed = itemsWithEntries
            .filter(item => item.entry.status === 'completed')
            .sort((a, b) => b.entry.updatedAt - a.entry.updatedAt);

        const main = [...watching, ...completed].slice(0, 4);

        return { thisSeason, main };
    }
};
