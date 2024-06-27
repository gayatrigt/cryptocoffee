import { supabase } from "@/app/lib/supabaseClient";
import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { env } from "process";
import { v4 as uuidv4 } from 'uuid';

export const runtime = "edge";

const interRegularFont = fetch(
  new URL("/public/inter/Inter-Regular.ttf", import.meta.url)
).then((res) => res.arrayBuffer());
const interBoldFont = fetch(
  new URL("/public/inter/Inter-Bold.ttf", import.meta.url)
).then((res) => res.arrayBuffer());
const integralBoldFont = fetch(
  new URL("/public/integral/IntegralCF-Bold.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

const handleRequest = frames(async (ctx) => {
  const [interRegularFontData, interBoldFontData, integralBoldFontData] =
    await Promise.all([interRegularFont, interBoldFont, integralBoldFont]);

  const channel = ctx.searchParams.channel
  const goal = ctx.message?.inputText
  const campaignId = uuidv4(); // Generate a unique campaign ID

  if (channel && goal) {
    createChannelRow(goal, channel, campaignId)
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
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            width: "70%",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}>
              <span style={{
                fontSize: "30px",
                fontFamily: "'IntegralCF', sans-serif",
                color: "white",
              }} tw="font-bold">
                Set the amount you want to raise for your campaign in USD
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    imageOptions: {
      width: 650,
      height: 356,
      fonts: [
        {
          name: "Inter",
          data: interRegularFontData,
          weight: 400,
        },
        {
          name: "Inter",
          data: interBoldFontData,
          weight: 700,
        },
        {
          name: "IntegralCF",
          data: integralBoldFontData,
          weight: 700,
        },
      ],
    },
    textInput: "$USD",
    buttons: [
      <Button action="post" target={`/chan/f/${campaignId}`}>
        Get the frame
      </Button>
    ]
  };
});

export function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/bgall.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;

async function createChannelRow(goal: string, channelId: string, campaignId: string) {
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
    const response = await fetch(`${env.HOST_URL}/api/channel-details?cid=${channelId}`);
    const data = await response.json();

    console.log('Fetched data:', data);

    if (data.channels && data.channels.length > 0) {
      const channel = data.channels[0];

      console.log('Channel data:', channel);

      // Prepare the row to insert
      const rowToInsert = {
        channel_name: channel.name || '',
        channel_id: channel.id,
        image_url: channel.image_url || '',
        parent_url: channel.parent_url || '',
        lead_fid: channel.lead?.fid,
        eth_address: channel.lead?.verifications?.[0] || '',
        campaign_id: campaignId,
        campaign_name: goal,
        goal_amt: 0,
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