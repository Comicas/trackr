import { NextRequest, NextResponse } from 'next/server';
import { MediaItem, MediaType } from '@/lib/types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const type = searchParams.get('type') as 'movie' | 'tv';

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    if (!process.env.TMDB_READ_TOKEN) {
        return NextResponse.json({ error: 'Server configuration error: Missing TMDB token' }, { status: 500 });
    }

    try {
        const endpoint = type === 'tv' ? '/search/tv' : '/search/movie';
        const response = await fetch(`${TMDB_BASE_URL}${endpoint}?query=${encodeURIComponent(query)}&language=en-US&page=1`, {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();

        const normalizedResults: MediaItem[] = data.results.map((item: any) => ({
            id: item.id.toString(), // We use string IDs internally
            type: type === 'tv' ? 'series' : 'movie',
            source: 'tmdb',
            sourceId: item.id.toString(),
            title: type === 'tv' ? item.name : item.title,
            year: item.release_date || item.first_air_date ? new Date(item.release_date || item.first_air_date).getFullYear() : undefined,
            coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
            rating: item.vote_average,
            meta: {
                originalLanguage: item.original_language,
                overview: item.overview,
            }
        }));

        return NextResponse.json({ results: normalizedResults });

    } catch (error) {
        console.error('TMDB Search Error:', error);
        return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 });
    }
}
