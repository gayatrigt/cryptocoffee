import { supabase } from "@/app/lib/supabaseClient";
import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { env } from "process";
import { v4 as uuidv4 } from 'uuid';
import { Channel } from "../fund/[camp]/route";


const handleRequest = frames(async (ctx) => {

  const fid = ctx.searchParams.fid
  const goal = ctx.message?.inputText

  const campaign = await createChannelRow(goal, fid)

  if (!campaign) {
    throw new Error("Error while creating campaign")
  }

  const campaignId = campaign.id

  return {
    image: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <BgImage />
      </div>
    ),
    imageOptions: {
      width: 650,
      height: 356,
    },
    textInput: "$USD",
    buttons: [
      <Button action="post" target={`/indi/fund/${campaignId}`}>
        Get the frame
      </Button>
    ]
  };
});

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/amount.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;

const createChannelRow = async (goal: string | undefined, fid: any): Promise<Channel> => {
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

    // Fetch channel details from API
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
      goal_amt: 0,
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