import { supabase } from "@/app/lib/supabaseClient";
import { loadFonts } from "@/app/utils/fontloader";
import { frames } from "@/app/utils/frames";
import { cache } from "@/app/utils/kvclient";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { NextRequest } from "next/server";
import { env } from "process";

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
  fid_indi: number;
  indi_name: string;
  goal_reached: Record<string, unknown>;
}

export const runtime = "edge";

const CAMPAIGN_CACHE_TTL = 2700; // 45 minutes for campaign details
const VERIFY_TIPS_CACHE_TTL = 300; // 5 minutes for verify-tips results

const handleRequest = async (
  req: NextRequest,
  { params: { camp: campaignId } }: { params: { camp: string } }
) => {
  console.log(`Request started for campaign: ${campaignId}`);
  const fonts = await loadFonts();

  return await frames(async (ctx) => {
    console.log('Frames function started');

    const campaign = campaignId;
    const inputText = ctx.message?.inputText;
    const hash = ctx.message?.castId?.hash

    console.log("castid:", ctx.message?.castId)

    if (inputText) {
      console.log(`Updating goal amount to: ${inputText}`);
      const updateResponse = await supabase
        .from('channels')
        .update({ goal_amt: parseFloat(inputText) })
        .eq('id', campaign);

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
        1500 // 4 timeout
      )
    );

    const fetchDataPromise = (async () => {
      console.log('Starting fetchDataPromise');

      const campaignDetails = await getCampaignDetails(campaign);
      const data = campaignDetails;

      const tipsValid = Number(ctx.message?.castId?.fid) == Number(data.fid_indi)

      console.log(ctx.message?.castId)
      console.log("tips:", tipsValid)

      if (hash && tipsValid == true) {
        verifyTips(hash, campaignId)
      }

      const amount = inputText || data.goal_amt;
      const progress = await calculateProgress(amount, campaign);

      const progressPercentage = `${progress.percentageCompleted}%`;

      const words = data.campaign_name

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
                    Support {data.indi_name}
                  </span>
                  <span style={{
                    fontSize: "30px",
                    marginTop: "20px",
                    fontFamily: "'IntegralCF', sans-serif",
                    color: "white",
                  }} tw="font-bold">
                    {words}
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
                  position: "relative",
                  marginTop: "10px"
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
                {tipsValid && (
                  <span style={{
                    fontSize: "12px",
                    fontFamily: "'IntegralCF', sans-serif",
                    fontWeight: "400",
                    color: "white",
                    marginTop: "30px"
                  }} tw="font-bold">
                    You can also Support with Degen Tips 👇
                  </span>
                )}
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
          <Button action="post" target={`/indi/fund/${campaign}`}>
            Refresh
          </Button>,
          <Button action="post" target={`/indi/${campaign}`}>
            Support
          </Button>,
          <Button action='link'
            key={"share"} target={`https://warpcast.com/~/compose?embeds[]=https://cryptocoffee-opal.vercel.app/frames/indi/fund/${campaign}`}>
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
    // If not in cache, fetch from database
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Campaign not found');
    }

    // Cache the result before returning
    await cache.set(cacheKey, data, { ex: CAMPAIGN_CACHE_TTL });

    return data as Channel;
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    throw error;
  }
}

interface SumResult {
  sum_amt_usd: number | null;
}

async function fetchTransactions(campaignId: string) {
  const { data, error } = await supabase
    .from('Transactions')
    .select('amt_usd')
    .eq('id', campaignId);

  if (error) {
    console.error('Error fetching transactions for campaign ID', campaignId, ':', error);
    return []; // Return an empty array if there's an error
  }

  return data.map(entry => entry.amt_usd);  // Extracting the amount in USD from each transaction
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

