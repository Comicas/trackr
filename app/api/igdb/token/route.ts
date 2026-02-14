import { NextResponse } from 'next/server';

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function POST() {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: 'Server configuration error: Missing IGDB credentials' }, { status: 500 });
    }

    // Check cache
    if (cachedToken && Date.now() < tokenExpiry) {
        return NextResponse.json({ access_token: cachedToken });
    }

    try {
        const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Failed to get token: ${response.status}`);
        }

        const data = await response.json();
        cachedToken = data.access_token;
        // Expires in is in seconds, reduce by 60s for safety buffer
        tokenExpiry = Date.now() + ((data.expires_in - 60) * 1000);

        return NextResponse.json({ access_token: cachedToken });

    } catch (error) {
        console.error('IGDB Token Error:', error);
        return NextResponse.json({ error: 'Failed to authenticate with IGDB' }, { status: 500 });
    }
}
