import { supabase } from "@/app/lib/supabaseClient";
import { frames } from "@/app/utils/frames";
import { error } from "console";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { env } from "process";
import { v4 as uuidv4 } from 'uuid';
import { Channel } from "../f/[camp]/route";

export const runtime = "edge";

const handleRequest = frames(async (ctx) => {

  const channel = ctx.searchParams.channel
  const goal = ctx.message?.inputText

  const campaign = await createChannelRow(goal, channel)

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
      <Button action="post" target={`/chan/f/${campaignId}`}>
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

const createChannelRow = async (goal: string | undefined, channelId: string): Promise<Channel> => {
  try {
    // Test Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('channels')
      .select()
      .limit(1);

    if (testError) {
      console.error('Supabase connection test failed:', testError);
      throw testError;
    }

    // Fetch channel details from API
    const response = await fetch(`${env.HOST_URL}/api/channel-details?cid=${channelId}`);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const channelData = await response.json();

    console.log('Fetched channel data:', channelData);

    if (!channelData.channels || channelData.channels.length === 0) {
      throw new Error('Channel not found');
    }

    const channel = channelData.channels[0];

    const rowToInsert = {
      channel_name: channel.name || '',
      channel_id: channel.id,
      image_url: channel.image_url || '',
      parent_url: channel.parent_url || '',
      lead_fid: channel.lead?.fid,
      eth_address: channel.lead?.verifications?.[0] || '',
      campaign_name: goal,
      goal_amt: 0,
      goal_reached: JSON.stringify({}),
      created_at: new Date().toISOString(),
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
      .eq('channel_id', rowToInsert.channel_id)
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
}