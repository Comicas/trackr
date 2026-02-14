import { NextRequest, NextResponse } from 'next/server';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const type = searchParams.get('type') as 'movie' | 'tv'; // 'movie' or 'tv'

    if (!id || !type) {
        return NextResponse.json({ error: 'Missing id or type parameters' }, { status: 400 });
    }

    if (!process.env.TMDB_READ_TOKEN) {
        return NextResponse.json({ error: 'Server configuration error: Missing TMDB token' }, { status: 500 });
    }

    try {
        // NOTE: We might not need the full details for this milestone, but it's good to have.
        // For now, let's just fetch basic details.
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}?language=en-US`, {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('TMDB Details Error:', error);
        return NextResponse.json({ error: 'Failed to fetch details from TMDB' }, { status: 500 });
    }
}
