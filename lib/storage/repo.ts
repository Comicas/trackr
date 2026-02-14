import { getDB } from './db';
import { MediaItem, ListEntry, MediaStatus, MediaType, MediaItemWithEntry } from '@/lib/types';

export const repo = {
    async upsertMediaItem(item: MediaItem) {
        const db = await getDB();
        await db.put('mediaItems', item);
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
    },

    async removeEntry(mediaId: string) {
        const db = await getDB();
        await db.delete('listEntries', mediaId);
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
    }
};
