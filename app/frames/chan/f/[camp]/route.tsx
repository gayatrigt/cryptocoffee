import { supabase } from "@/app/lib/supabaseClient";
import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { NextRequest } from "next/server";
import { env } from "process";

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
  const [interRegularFontData, interBoldFontData, integralBoldFontData] =
    await Promise.all([interRegularFont, interBoldFont, integralBoldFont]);

  return await frames(async (ctx) => {
    const campaign = campaignId;
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

    const data = await getCampaignDetails(campaign);
    const amount = inputText || data.goal_amt;

    const progress = await calculateProgress(amount, campaign);

    const cid = campaign;
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
                  fontFamily: "'Inter', sans-serif",
                  color: "white",
                }} tw="font-normal">
                  Support {data.channel_name}
                </span>
                <span style={{
                  fontSize: "30px",
                  marginTop: "5px",
                  fontFamily: "'IntegralCF', sans-serif",
                  color: "white",
                }} tw="font-bold">
                  {data.campaign_name}
                </span>
                <span style={{
                  fontSize: "25px",
                  marginTop: "5px",
                  fontFamily: "'IntegralCF', sans-serif",
                  color: "white",
                }} tw="font-bold">
                  Goal: ${amount}
                </span>
              </div>
              <div style={{
                width: "300px",
                height: "40px",
                border: "2px solid #ccc",
                borderRadius: "30px",
                overflow: "hidden",
                marginTop: "20px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(240, 240, 240, 0.2)"
              }}>
                <div style={{
                  width: `30%`,
                  height: "100%",
                  backgroundColor: "#D98243",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <span style={{
                    color: "white",
                    marginLeft: "2px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    {progress.amountCollected}
                  </span>
                </div>
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
      buttons: [
        <Button action="post" target={`/chan/f/${campaign}`}>
          Refresh
        </Button>,
        <Button action="post" target={`/chan/${cid}`}>
          Support
        </Button>,
        <Button action='link'
          key={"share"} target={`https://warpcast.com/~/compose?embeds[]=https://cryptocoffee-opal.vercel.app/frames/channel/fund/${campaign}`}>
          Share Frame
        </Button>
      ],
    };
  })(req);
};

export function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/chain.png`} alt="background" width={width} tw={tw} />;
}

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

