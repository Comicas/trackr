export type MediaType = 'movie' | 'series' | 'anime' | 'game';

export type MediaStatus =
    | 'plan'
    | 'watching'
    | 'completed'
    | 'dropped'
    | 'backlog'
    | 'playing';

export interface MediaItem {
    id: string; // uuid
    type: MediaType;
    source: 'manual' | 'tmdb' | 'igdb' | 'mal'; // extendable
    sourceId?: string;
    title: string;
    year?: number;
    coverUrl?: string;
    rating?: number; // 0-10 or 0-5
    meta?: Record<string, any>; // flexible metadata
}

export interface ListEntry {
    mediaId: string;
    status: MediaStatus;
    userRating?: number; // 0-10
    progress?: number; // episode count, hours played, etc.
    notes?: string;
    createdAt: number; // timestamp
    updatedAt: number; // timestamp
}

export interface MediaItemWithEntry extends MediaItem {
    entry?: ListEntry;
}

export type Settings = {
    theme?: 'light' | 'dark' | 'system';
    [key: string]: any;
};

export const DB_NAME = 'trackr-db';
export const DB_VERSION = 1;
