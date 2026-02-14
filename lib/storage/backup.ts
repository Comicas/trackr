import { getDB } from './db';
import { DB_VERSION, MediaItem, ListEntry } from '@/lib/types';

export const backup = {
    async exportAll() {
        const db = await getDB();
        const mediaItems = await db.getAll('mediaItems');
        const listEntries = await db.getAll('listEntries');
        const settings = await db.getAll('settings');

        const backupData = {
            version: DB_VERSION,
            timestamp: Date.now(),
            data: {
                mediaItems,
                listEntries,
                settings
            }
        };

        return JSON.stringify(backupData, null, 2);
    },

    async importAll(jsonString: string) {
        try {
            const parsed = JSON.parse(jsonString);

            // Basic validation
            if (!parsed.data || !parsed.data.mediaItems || !parsed.data.listEntries) {
                throw new Error('Invalid backup format');
            }

            const db = await getDB();
            const tx = db.transaction(['mediaItems', 'listEntries', 'settings'], 'readwrite');

            // Import Media Items
            for (const item of parsed.data.mediaItems) {
                await tx.objectStore('mediaItems').put(item);
            }

            // Import List Entries
            for (const entry of parsed.data.listEntries) {
                await tx.objectStore('listEntries').put(entry);
            }

            // Import Settings (optional)
            if (parsed.data.settings) {
                // Assuming settings key is reliable or we just overwrite
                // For now let's just put them in if they exist
                const settingsStore = tx.objectStore('settings');
                // We might need to handle settings differently depending on structure
                // But for now, assuming simple key-value or similar
                // If settings is array of values with keys
                if (Array.isArray(parsed.data.settings)) {
                    for (const setting of parsed.data.settings) {
                        await settingsStore.put(setting);
                    }
                }
            }

            await tx.done;
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    }
};
