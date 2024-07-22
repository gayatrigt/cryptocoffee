import { Channel } from '@/app/frames/indi/fund/[camp]/route';
import { supabase } from '@/app/lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from 'process';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { goal, fid, goalamt } = req.body;

        if (!goal || !fid || !goalamt) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const channel = await createChannelRow(goal, parseInt(fid), parseFloat(goalamt));

        res.status(200).json({ message: 'Channel created successfully', channel });
    } catch (error) {
        console.error('Error in API route:', error);
        res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
    }
}

const createChannelRow = async (goal: string | undefined, fid: number, goal_amt: number): Promise<Channel> => {
    try {
        // Test Supabase connection
        const { data: testData, error: testError } = await supabase
            .from('channels')
            .select('*')
            .limit(1);

        if (testError) {
            console.error('Supabase connection test failed:', testError);
            throw testError;
        }

        // Fetch user details from API
        const response = await fetch(`${env.HOST_URL}/api/user-details?fid=${fid}`);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();

        console.log('Fetched data:', data);

        if (!data.users || data.users.length === 0) {
            throw new Error('User not found');
        }

        const user = data.users[0];

        console.log('User data:', user);

        // Prepare the row to insert
        const rowToInsert = {
            image_url: user.pfp_url || '',
            fid_indi: fid,
            eth_address: user.verified_addresses.eth_addresses[0] || '',
            campaign_name: goal,
            goal_amt,
            indi_name: user.display_name,
            goal_reached: JSON.stringify({}), // Convert to string if Supabase expects a string
            created_at: new Date().toISOString(), // Add created_at field
        };

        console.log('Attempting to insert:', rowToInsert);

        const { error: insertError } = await supabase
            .from('channels')
            .insert([rowToInsert]);

        if (insertError) {
            console.error('Supabase insertion error:', insertError);
            throw insertError;
        }

        // Fetch the inserted data
        const { data: fetchedData, error: fetchError } = await supabase
            .from('channels')
            .select('*')
            .eq('fid_indi', rowToInsert.fid_indi)
            .order('created_at', { ascending: false })
            .limit(1);

        if (fetchError) {
            console.error('Error fetching inserted data:', fetchError);
            throw fetchError;
        }

        if (!fetchedData || fetchedData.length === 0) {
            throw new Error('Could not fetch inserted campaign data');
        }

        const insertedData = fetchedData[0];
        console.log('Row created successfully:', insertedData);
        return insertedData as Channel;

    } catch (error) {
        console.error('Error in createChannelRow:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        throw error;
    }
};