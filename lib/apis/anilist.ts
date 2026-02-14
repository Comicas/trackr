import { MediaItem } from '@/lib/types';

export const anilist = {
    async search(query: string): Promise<MediaItem[]> {
        if (!query) return [];

        const res = await fetch('/api/anilist/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        if (!res.ok) {
            throw new Error(`Search failed: ${res.statusText}`);
        }

        const data = await res.json();
        return data.results || [];
    }
};
