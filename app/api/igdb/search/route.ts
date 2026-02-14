import { NextRequest, NextResponse } from 'next/server';
import { MediaItem } from '@/lib/types';

// Helper to get token internally (we can repurpose the logic or call the endpoint, simpler to reuse logic or just duplicate for now to avoid Request instantiation overhead internally? 
// Actually simplest is to just call the token endpoint logic directly if we extract it, but for now I'll just fetch my own API or duplicate the simplified logic.)
// Let's duplicate simplified token fetch/cache for robustness here or better yet, verify if we can import.
// Next.js route handlers are isolated. Let's just fetch the token from the token endpoint via fetch (loopback) OR share a lib.
// Sharing state across route handlers in Next.js serverless is tricky. Only works if long-running server.
// For now, I'll fetch the token from Twitch directly here too, using the same global variable pattern (which might reset per invocation in serverless but works in dev/long-running).
// Actually, strictly speaking, calling Twitch every time is fine for low volume, but better to cache.
// I'll implement the token fetch helper inside this file for simplicity to avoid loopback network calls.

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) throw new Error("Missing credentials");

    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
        method: 'POST'
    });

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + ((data.expires_in - 60) * 1000);
    return cachedToken!;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ results: [] });
        }

        const token = await getAccessToken();
        const clientId = process.env.TWITCH_CLIENT_ID!;

        // IGDB Query
        // Search for games, get fields. We want cover URL specifically.
        // Cover is a separate resource expanded or ID. 'cover.url' helper works.
        const igdbQuery = `
      fields name, first_release_date, cover.url, total_rating, summary;
      search "${query.replace(/"/g, '\\"')}";
      limit 10;
    `;

        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain',
            },
            body: igdbQuery
        });

        if (!response.ok) {
            throw new Error(`IGDB API error: ${response.status}`);
        }

        const data = await response.json();

        const normalizedResults: MediaItem[] = data.map((item: any) => ({
            id: item.id.toString(),
            type: 'game',
            source: 'igdb',
            sourceId: item.id.toString(),
            title: item.name,
            year: item.first_release_date ? new Date(item.first_release_date * 1000).getFullYear() : undefined,
            // cover.url usually comes as "//images.igdb.com/igdb/image/upload/t_thumb/..."
            // We want bigger size. t_cover_big is good.
            coverUrl: item.cover?.url ? `https:${item.cover.url.replace('t_thumb', 't_cover_big')}` : undefined,
            rating: item.total_rating ? item.total_rating / 10 : undefined, // Scale 0-100 to 0-10
            meta: {
                summary: item.summary
            }
        }));

        return NextResponse.json({ results: normalizedResults });

    } catch (error) {
        console.error('IGDB Search Error:', error);
        return NextResponse.json({ error: 'Failed to fetch from IGDB' }, { status: 500 });
    }
}
