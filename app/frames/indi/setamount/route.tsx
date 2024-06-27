import { supabase } from "@/app/lib/supabaseClient";
import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { env } from "process";
import { v4 as uuidv4 } from 'uuid';


const handleRequest = frames(async (ctx) => {

  const fid = ctx.searchParams.fid
  const goal = ctx.message?.inputText
  const campaignId = uuidv4(); // Generate a unique campaign ID

  if (fid && goal) {
    createChannelRow(goal, fid, campaignId)
  }

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

async function createChannelRow(goal: string, fid: any, campaignId: string) {
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
    const data = await response.json();

    console.log('Fetched data:', data);

    if (data.users && data.users.length > 0) {
      const user = data.users[0];

      console.log('User data:', user);

      // Prepare the row to insert
      const rowToInsert = {
        image_url: user.pfp_url || '',
        fid_indi: fid,
        eth_address: user.verified_addresses.eth_addresses[0] || '',
        campaign_id: campaignId,
        campaign_name: goal,
        goal_amt: 0,
        indi_name: user.display_name,
        goal_reached: JSON.stringify({}), // Convert to string if Supabase expects a string
      };

      console.log('Attempting to insert:', rowToInsert);

      // Insert the new row into the Supabase table
      const { data: insertedData, error } = await supabase
        .from('channels')
        .insert([rowToInsert]);

      if (error) {
        console.error('Supabase insertion error:', error);
        throw error;
      }

      console.log('Row created successfully:', insertedData);
      return insertedData;
    } else {
      throw new Error('Channel not found');
    }
  } catch (error) {
    console.error('Error creating channel row:', error);
    throw error;
  }
}