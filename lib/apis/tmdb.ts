import { MediaItem, MediaType } from '@/lib/types';

export const tmdb = {
    async search(query: string, type: 'movie' | 'series'): Promise<MediaItem[]> {
        if (!query) return [];

        // Map our internal type 'series' to TMDB's 'tv'
        const tmdbType = type === 'series' ? 'tv' : 'movie';

        const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}&type=${tmdbType}`);
        if (!res.ok) {
            throw new Error(`Search failed: ${res.statusText}`);
        }

        const data = await res.json();
        return data.results || [];
    },

    async getDetails(id: string, type: 'movie' | 'series') {
        const tmdbType = type === 'series' ? 'tv' : 'movie';
        const res = await fetch(`/api/tmdb/details?id=${id}&type=${tmdbType}`);
        if (!res.ok) {
            throw new Error(`Details failed: ${res.statusText}`);
        }
        return await res.json();
    }
};
