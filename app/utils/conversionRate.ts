// lib/conversionRate.ts
import { supabase } from '../lib/supabaseClient';

const CONVERSION_RATE_API_URL = 'https://www.farcaster.in/api/tokens/degen'; // replace with actual API URL

export async function fetchConversionRate(): Promise<number> {
    const response = await fetch(CONVERSION_RATE_API_URL);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const rate = parseFloat(data.stats.base_token_price_usd);

    console.log("converrate:", rate);

    await supabase
        .from('conversion_rate')
        .insert([{ rate, updated_at: new Date() }]);

    return rate;
}

export async function getConversionRate(): Promise<number> {
    const { data, error } = await supabase
        .from('conversion_rate')
        .select('rate')
        .order('updated_at', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        throw new Error('Error fetching conversion rate');
    }

    console.log(data);

    return data[0].rate;
}