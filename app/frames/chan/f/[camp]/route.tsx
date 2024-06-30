import { supabase } from "@/app/lib/supabaseClient";
import { loadFonts } from "@/app/utils/fontloader";
import { frames } from "@/app/utils/frames";
import { cache } from "@/app/utils/kvclient";
import { Button } from "frames.js/next";
import { NextRequest } from "next/server";
import { env } from "process";

export const runtime = "edge";

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

const CAMPAIGN_CACHE_TTL = 2700; // 45 minutes for campaign details
const VERIFY_TIPS_CACHE_TTL = 300; // 5 minutes for verify-tips results

const handleRequest = async (
  req: NextRequest,
  { params: { camp: campaignId } }: { params: { camp: string } }
) => {
  console.log(`Request started for campaign: ${campaignId}`);
  const fonts = await loadFonts();

  return await frames(async (ctx) => {
    const campaign = campaignId;
    const inputText = ctx.message?.inputText;
    const hash = ctx.message?.castId?.hash


    if (inputText) {
      console.log(`Updating goal amount to: ${inputText}`);
      const updateResponse = await supabase
        .from('channels')
        .update({ goal_amt: parseFloat(inputText) })
        .eq('campaign_id', campaign);

      if (updateResponse.error) {
        throw updateResponse.error;
      }
      await cache.set(`campaign:${campaign}`, null);
    }

    const timeoutPromise = new Promise<any>((resolve) =>
      setTimeout(() =>
        resolve({
          image: (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              position: "relative",
            }}>
              <BgImage />
              <div style={{
                position: "absolute",
                fontSize: "24px",
                color: "white",
                fontFamily: "'Inter', sans-serif",
              }}>
                Calculating the Goal.
                Please Wait....
              </div>
              <span style={{
                fontSize: "12px",
                color: "white",
                fontFamily: "'Inter', sans-serif",
              }}>
                Data is cached, so new updates will happen every 10 mins
              </span>
            </div>
          ),
          imageOptions: {
            width: 650,
            height: 356,
            fonts: [
              {
                name: "Inter",
                data: fonts.interRegular,
                weight: 400,
              },
            ],
          },
          buttons: [
            <Button action="post" target={`/indi/fund/${campaignId}`}>
              Refresh
            </Button>,
          ],
        }),
        1500 // timeout
      )
    );

    const fetchDataPromise = (async () => {
      console.log('Starting fetchDataPromise');

      let campaignDetails, verifyTipsResult;

      if (hash) {
        // If hash is available, run both processes in parallel
        [campaignDetails, verifyTipsResult] = await Promise.all([
          getCampaignDetails(campaign),
          verifyTips(hash, campaignId)
        ]);
        console.log('Campaign details fetched and tips verified');
      } else {
        // If no hash, only fetch campaign details
        campaignDetails = await getCampaignDetails(campaign);
        console.log('Campaign details fetched');
      }

      console.log('Campaign details and tips verified, calculating progress');
      const data = campaignDetails;
      const amount = inputText || data.goal_amt;
      const progress = await calculateProgress(amount, campaign);
      const progressPercentage = `${progress.percentageCompleted}%`;

      const words = data.campaign_name

      const cid = campaign;
      console.log('Preparing response');
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
                    fontSize: "20px",
                    fontFamily: "'Inter', sans-serif",
                    color: "white",
                  }} tw="font-normal">
                    Support {data.channel_name}
                  </span>
                  <span style={{
                    fontSize: "30px",
                    marginTop: "20px",
                    fontFamily: "'IntegralCF', sans-serif",
                    color: "white",
                  }} tw="font-bold">
                    {data.campaign_name}
                  </span>
                  <span style={{
                    fontSize: "15px",
                    fontFamily: "'IntegralCF', sans-serif",
                    fontWeight: "400",
                    color: "white",
                    marginTop: "10px"
                  }} tw="font-bold">
                    GOAL: ${amount}
                  </span>
                </div>
                <div style={{
                  width: "300px",
                  height: "40px",
                  border: "2px solid #ccc",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(240, 240, 240, 0.2)",
                  position: "relative"
                }}>
                  <div style={{
                    width: `${progressPercentage}`,
                    height: "100%",
                    backgroundColor: "#D98243",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "absolute",
                    left: "0",
                    top: "0",
                  }}>
                    <span style={{
                      color: "white",
                      fontSize: "25px",
                      fontWeight: "400",
                      fontFamily: "'IntegralCF', sans-serif",
                      textAlign: "center",
                      position: "relative",
                    }}>
                      ${progress.amountCollected}
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
              data: fonts.interRegular,
              weight: 400,
            },
            {
              name: "Inter",
              data: fonts.interBold,
              weight: 700,
            },
            {
              name: "IntegralCF",
              data: fonts.integralBold,
              weight: 700,
            },
            {
              name: "IntegralCF",
              data: fonts.integralRegular,
              weight: 400,
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
    })();
    return Promise.race([timeoutPromise, fetchDataPromise]);
  })(req);
};

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/bgplain.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;

async function getCampaignDetails(campaignId: string): Promise<Channel> {
  const cacheKey = `campaign:${campaignId}`;

  // Try to get from cache
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    console.log('Campaign details retrieved from cache');
    return cachedData as Channel;
  }

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
      throw new Error(`Campaign not found, expected data for id: ${campaignId}`);
    }

    // Cache the result before returning
    await cache.set(cacheKey, data, { ex: CAMPAIGN_CACHE_TTL });

    return data as Channel;
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    throw error;
  }
}

async function calculateProgress(goal: any, campaignId: string) {
  try {
    const { data, error } = await supabase
      .rpc('sum_transactions', { campaign_id: campaignId });

    if (error) {
      console.error('Error fetching transactions sum for campaign ID', campaignId, ':', error);
      return {
        amountCollected: 0,
        percentageCompleted: 0
      };
    }

    const totalCollected = data || 0;

    // Calculate the percentage of the goal reached
    const rawPercentage = (totalCollected / goal) * 100;
    const percentageCompleted = Math.min(100, Math.round(rawPercentage));

    console.log("%", percentageCompleted)

    // Return both the amount collected and the percentage completion
    return {
      amountCollected: Number(totalCollected.toFixed(2)),
      percentageCompleted: Math.min(100, Math.round(percentageCompleted))
    };
  } catch (error) {
    console.error('Error calculating progress:', error);
    return {
      amountCollected: 0,
      percentageCompleted: 0
    };
  }
}

async function verifyTips(hash: string, campaignId: string) {
  const cacheKey = `verify-tips:${hash}:${campaignId}`;

  // Try to get from cache
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    console.log('Verify-tips results retrieved from cache');
    return cachedData;
  }

  try {
    const response = await fetch(`${env.HOST_URL}/api/verify-tips?hash=${hash}&campaign_id=${campaignId}`);
    const data = await response.json();

    // Cache the result before returning
    await cache.set(cacheKey, data, { ex: VERIFY_TIPS_CACHE_TTL });

    return data;
  } catch (error) {
    console.error('Error verifying tips:', error);
    throw error;
  }
}

