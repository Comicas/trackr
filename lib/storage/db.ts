import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MediaItem, ListEntry, Settings, DB_NAME, DB_VERSION } from '@/lib/types';

interface TrackrDB extends DBSchema {
    mediaItems: {
        key: string;
        value: MediaItem;
        indexes: { 'by-type': string };
    };
    listEntries: {
        key: string;
        value: ListEntry;
        indexes: { 'by-status': string };
    };
    settings: {
        key: string;
        value: any;
    };
}

let dbPromise: Promise<IDBPDatabase<TrackrDB>>;

export const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<TrackrDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Media Items store
                if (!db.objectStoreNames.contains('mediaItems')) {
                    const store = db.createObjectStore('mediaItems', { keyPath: 'id' });
                    store.createIndex('by-type', 'type');
                }

                // List Entries store
                if (!db.objectStoreNames.contains('listEntries')) {
                    const store = db.createObjectStore('listEntries', { keyPath: 'mediaId' });
                    store.createIndex('by-status', 'status');
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            },
        });
    }
    return dbPromise;
};
