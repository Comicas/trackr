import { MediaItem } from '@/lib/types';

export const igdb = {
    async search(query: string): Promise<MediaItem[]> {
        if (!query) return [];

        // IGDB needs POST as well because of body payload in my proxy implementation?
        // Wait, my proxy accepts JSON body { query: "..." }
        const res = await fetch('/api/igdb/search', {
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
