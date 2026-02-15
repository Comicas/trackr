
'use client';

import { useState, useEffect } from 'react';
import { repo } from '@/lib/storage/repo';

export function useCompletedCounts() {
    const [counts, setCounts] = useState({
        anime: 0,
        games: 0,
        movies: 0,
        series: 0,
    });

    useEffect(() => {
        let mounted = true;

        const fetchCounts = async () => {
            try {
                const data = await repo.getCompletedCounts();
                if (mounted) {
                    setCounts({
                        anime: data.anime,
                        games: data.games,
                        movies: data.movies,
                        series: data.series, // Ensure mapping matches UI expectations
                    });
                }
            } catch (error) {
                console.error('Failed to fetch completed counts:', error);
            }
        };

        // Initial fetch
        fetchCounts();

        // Subscribe to changes
        const unsubscribe = repo.subscribe(() => {
            fetchCounts();
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    return counts;
}
