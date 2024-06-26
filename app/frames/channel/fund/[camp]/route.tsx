import { supabase } from "@/app/lib/supabaseClient";
import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { NextRequest } from "next/server";

// Define the interface for the channel data
export interface Channel {
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

const handleRequest = async (
  req: NextRequest,
  { params: { camp: campaignId } }: { params: { camp: string } }
) => {

  return await frames(async (ctx) => {

    const campaign = campaignId

    const inputText = ctx.message?.inputText;

    if (inputText) {
      // Update goal_amt if inputText is present
      const updateResponse = await supabase
        .from('channels')
        .update({ goal_amt: parseFloat(inputText) })
        .eq('campaign_id', campaign);

      if (updateResponse.error) {
        throw updateResponse.error;
      }
    }

    const data = await getCampaignDetails(campaign)
    const amount = inputText || data.goal_amt;

    const progress = await calculateProgress(amount, campaign)

    const cid = campaign
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
                  fontSize: "30px"
                }
              } tw="font=normal" >
                Support {data.channel_name}
              </span>
              <span style={
                {
                  fontSize: "50px",
                  marginTop: "5px"
                }
              } tw="font=bold" > {data.campaign_name}
              </span>
              <span style={
                {
                  fontSize: "35px"
                }
              } tw="font=bold" > Goal: ${amount}
              </span>
            </div>
            <div style={{
              width: "500px",
              height: "80px",
              border: "2px solid #ccc",
              borderRadius: "30px",
              overflow: "hidden",
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f0f0f0"
            }}>
              <div style={{
                width: `${progress.percentageCompleted}%`,
                height: "100%",
                backgroundColor: "#4CAF50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{
                  color: "white",
                  fontSize: "25px",
                  fontWeight: "bold"
                }}>
                  {progress.amountCollected}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
      buttons: [
        <Button action="post" target={`/channel/fund/${campaign}`}>
          Refresh
        </Button>,
        <Button action="post" target={`/channel/${cid}`}>
          Support
        </Button>,
        <Button action='link'
          key={"share"} target={`https://warpcast.com/~/compose?embeds[]=https://cryptocoffee-opal.vercel.app/frames/channel/fund/${campaign}`}>
          Share Frame
        </Button>
      ]
      ,
    };
  })(req)
};

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

async function fetchTransactions(campaignId: string) {
  const { data, error } = await supabase
    .from('Transactions')
    .select('amt_usd')
    .eq('campaign_id', campaignId);

  if (error) {
    console.error('Error fetching transactions for campaign ID', campaignId, ':', error);
    return []; // Return an empty array if there's an error
  }

  return data.map(entry => entry.amt_usd);  // Extracting the amount in USD from each transaction
}

async function calculateProgress(goal: any, campaignId: string) {
  try {
    const amounts = await fetchTransactions(campaignId);
    if (amounts.length === 0) {
      return {
        amountCollected: 0,
        percentageCompleted: 0
      };
    }

    let totalCollected = amounts.reduce((sum, amount) => sum + parseFloat(amount), 0);

    // Calculate the percentage of the goal reached
    const percentageCompleted = (totalCollected / goal) * 100;

    // Return both the amount collected and the percentage completion
    return {
      amountCollected: totalCollected,
      percentageCompleted: Math.round(percentageCompleted) // Formatting to two decimal places
    };
  } catch (error) {
    console.error('Error calculating progress:', error);
    return {
      amountCollected: 0,
      percentageCompleted: 0
    };
  }
}

