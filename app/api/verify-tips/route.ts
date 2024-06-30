import { kv } from '@vercel/kv';
import { Cast, Root } from '@/app/utils/neynarcast';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabaseClient';
import { cache } from '@/app/utils/kvclient';

const NEYNAR_API_URL = 'https://api.neynar.com/v2/farcaster/cast/conversation';

async function fetchNeynarData(hash: string, cursor: string | null = null): Promise<Root> {
    const params = new URLSearchParams({
        identifier: hash,
        type: 'hash',
        reply_depth: '1',
        include_chronological_parent_casts: 'false',
        limit: '50'
    });

    if (cursor) {
        params.append('cursor', cursor);
    }

    try {
        const response = await fetch(`${NEYNAR_API_URL}?${params.toString()}`, {
            headers: {
                'api_key': process.env.NEYNAR_API_KEY as string
            }
        });

        if (!response.ok) {
            throw new Error(`Neynar API HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching Neynar data:', error);
        throw error;
    }
}

interface DegenTipResponse {
    username: string;
    fid: number;
    tip_amount: number;
    timestamp: string;
}

async function fetchDegenTipData(castHash: string): Promise<DegenTipResponse | null> {
    try {
        const response = await fetch(`https://www.degentip.me/api/get_degen_successful_tips?hash=${castHash}`);

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`DegenTip API HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching DegenTip data:', error);
        return null;
    }
}

async function getConversionRate(): Promise<number> {
    const cacheKey = 'degen_usd_rate';
    let rate = await cache.get(cacheKey);

    if (!rate) {
        const { data, error } = await supabase
            .from('conversion_rate')
            .select('rate')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            throw new Error('Error fetching conversion rate');
        }

        rate = data.rate;
        // Cache for 24 hours
        await cache.set(cacheKey, rate, { ex: 86400 });
    }

    return rate as number;
}

function convertDegenToUSD(degenAmount: number, rate: number): number {
    const usdAmount = degenAmount * rate;
    const roundedAmount = Math.round(usdAmount);
    // If the rounded amount is 0 but the original amount was non-zero, return 1
    return roundedAmount === 0 && degenAmount > 0 ? 1 : roundedAmount;
}

async function processNeynarData(hash: string, campaign_id: string, cursor: string | null = null) {
    try {
        const neynarData: Root = await fetchNeynarData(hash, cursor);
        const mainCast = neynarData.conversation.cast as Cast;
        const replies = mainCast.direct_replies || [];

        const rate = await getConversionRate();

        const existingHashes = new Set((await supabase
            .from('Transactions')
            .select('degen_hash')
            .eq('id', campaign_id)
            .in('degen_hash', replies.map(reply => reply.hash))).data?.map(d => d.degen_hash) || []);

        const tipPromises = replies
            .filter(reply => reply.text.toLowerCase().includes('degen'))
            .map(async (reply) => {
                const castHash = reply.hash;
                if (existingHashes.has(castHash)) {
                    console.log(`Skipping hash ${castHash} as it already exists in the database for this campaign.`);
                    return null;
                }
                const degenTipData = await fetchDegenTipData(castHash);
                if (degenTipData && degenTipData.tip_amount && degenTipData.fid) {
                    const usdAmount = convertDegenToUSD(degenTipData.tip_amount, rate);
                    return {
                        amt_usd: usdAmount,
                        to_fid: mainCast.author.fid,
                        campaign_id,
                        chain: 'degen',
                        degen_tip: degenTipData.tip_amount,
                        degen_fid: degenTipData.fid,
                        degen_hash: castHash,
                    };
                }
                console.log(`No valid tip data for hash ${castHash}, skipping.`);
                return null;
            });

        const tipsToSave = (await Promise.all(tipPromises)).filter(tip => tip !== null);

        if (tipsToSave.length > 0) {
            const { data, error } = await supabase
                .from('Transactions')
                .insert(tipsToSave);

            if (error) {
                console.error('Error saving tips to Supabase:', error);
            } else {
                console.log(`Saved ${tipsToSave.length} tips to Supabase.`);
            }
        }

        if (neynarData.next.cursor) {
            await processNeynarData(hash, campaign_id, neynarData.next.cursor);
        } else {
            console.log('Finished processing all replies.');
        }
    } catch (error) {
        console.error('Error processing Neynar data:', error);
        throw error;
    }
}

export async function GET(request: NextRequest) {
    return handleRequest(request);
}

export async function POST(request: NextRequest) {
    return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
    console.log(`Received ${request.method} request to /api/verify-tips`);
    const searchParams = request.nextUrl.searchParams;
    const hash = searchParams.get('hash');
    const campaign_id = searchParams.get('campaign_id');

    console.log(`Params - hash: ${hash}, campaign_id: ${campaign_id}`);

    if (!hash || !campaign_id) {
        console.error('Invalid hash or campaign_id');
        return NextResponse.json({ error: 'Invalid hash or campaign_id' }, { status: 400 });
    }

    try {
        console.log('Starting to process Neynar data');
        await processNeynarData(hash, campaign_id);
        console.log('Processing complete');
        return NextResponse.json({ message: 'Processing complete' }, { status: 200 });
    } catch (error) {
        console.error('Error in request handler:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
    }
}