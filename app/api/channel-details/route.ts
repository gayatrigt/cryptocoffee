import { NextRequest, NextResponse } from 'next/server';

// This API route fetches feed data based on the viewer_fid provided.
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');

    // Ensure that the viewer_fid is provided
    if (!cid) {
        return NextResponse.json({ error: 'viewer_fid is required as a query parameter' }, { status: 400 });
    }

    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY
    if (!NEYNAR_API_KEY) {
        throw new Error("Neynar kya kehna")
    }

    const apiUrl = `https://api.neynar.com/v2/farcaster/channel/search?q=${cid}`;
    const headers = {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
    };

    try {
        const response = await fetch(apiUrl, { method: 'GET', headers: headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch data from external API' }, { status: 500 });
    }
}