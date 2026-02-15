import { NextRequest, NextResponse } from 'next/server';
import { MediaItem } from '@/lib/types';

const ANILIST_API_URL = 'https://graphql.anilist.co';

const query = `
query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
      id
      title {
        english
        romaji
      }
      coverImage {
        large
      }
      season
      seasonYear
      averageScore
      episodes
      format
      status
      description
    }
  }
}
`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query: searchQuery } = body;

        if (!searchQuery) {
            return NextResponse.json({ results: [] });
        }

        const variables = {
            search: searchQuery,
            page: 1,
            perPage: 10
        };

        const response = await fetch(ANILIST_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            })
        });

        if (!response.ok) {
            throw new Error(`AniList API error: ${response.status}`);
        }

        const data = await response.json();

        // Check for errors in the GraphQL response
        if (data.errors) {
            console.error('AniList GraphQL Errors:', data.errors);
            throw new Error('AniList GraphQL Error');
        }

        const normalizedResults: MediaItem[] = data.data.Page.media.map((item: any) => ({
            id: item.id.toString(),
            type: 'anime',
            source: 'anilist',
            sourceId: item.id.toString(),
            title: item.title.english || item.title.romaji,
            year: item.seasonYear,
            coverUrl: item.coverImage.large,
            rating: item.averageScore ? item.averageScore / 10 : undefined, // Scale to 0-10
            meta: {
                season: item.season,
                seasonYear: item.seasonYear,
                status: item.status,
                episodes: item.episodes,
                format: item.format,
                description: item.description, // HTML description
            }
        }));

        return NextResponse.json({ results: normalizedResults });

    } catch (error) {
        console.error('AniList Search Error:', error);
        return NextResponse.json({ error: 'Failed to fetch from AniList' }, { status: 500 });
    }
}
