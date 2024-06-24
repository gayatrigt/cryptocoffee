import { supabase } from "@/app/lib/supabaseClient";
import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";

// Define the interface for the channel data
interface Channel {
  id: number;
  created_at: string;
  channel_name: string;
  channel_id: string;
  image_url: string;
  parent_url: string;
  lead_fid: number;
  eth_address: string;
  campaign_id: string;
  campaign_name: string;
  goal_amt: number;
  goal_reached: Record<string, unknown>;
}

const handleRequest = frames(async (ctx) => {

  const amount = ctx.message?.inputText
  const campaign = ctx.searchParams.campaign

  const data = await getCampaignDetails(campaign)

  return {
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
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
          <div style={
            {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }
          }>
            <span style={
              {
                fontSize: "20px"
              }
            } tw="font=normal" >
              Support FBI
            </span>
            <span style={
              {
                fontSize: "30px"
              }
            } tw="font=bold" > Bringing more builders on chain
            </span>
            <span style={
              {
                fontSize: "40px"
              }
            } tw="font=bold" > Goal: $10000
            </span>
          </div>
          <div style={{
            width: "200px",
            height: "30px",
            border: "2px solid #ccc",
            borderRadius: "15px",
            overflow: "hidden",
            marginTop: "20px",
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f0f0f0"
          }}>
            <div style={{
              width: "50%",
              height: "100%",
              backgroundColor: "#4CAF50",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "width 0.5s ease-in-out"
            }}>
              <span style={{
                color: "white",
                fontSize: "16px",
                fontWeight: "bold"
              }}>
                5000
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    buttons: [
      <Button action="post" target={{
        pathname: "/channel/fundframe", query: { campaign: campaign }
      }}
      >
        Refresh
      </Button>,
      <Button action="post" target={{
        pathname: "/channel/fundframe", query: { campaign: campaign }
      }}
      >
        Support
      </Button>,
      <Button action='link'
        key={"share"} target={`https://warpcast.com/~/compose?embeds[]=https://cryptocoffee-opal.vercel.app/frames/builder/`}>
        Share Frame
      </Button>
    ]
    ,
  };
});

export const GET = handleRequest;
export const POST = handleRequest;

async function getCampaignDetails(campaignId: string): Promise<Channel> {
  try {
    // Retrieve the campaign details
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('campaign_id', campaignId)
      .single(); // Use .single() to get a single object instead of an array

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Campaign not found');
    }

    return data as Channel;
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    throw error;
  }
}
