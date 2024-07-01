import { supabase } from "@/app/lib/supabaseClient";
import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { NextRequest } from "next/server";
import { Channel } from "../../f/[camp]/route";
import { env } from "process";
import { loadFonts } from "@/app/utils/fontloader";

export type State = {
  chain: string;
};

export const runtime = "edge";

const handleRequest = async (
  req: NextRequest,
  { params: { cid: campaign } }: { params: { cid: string } }
) => {

  const fonts = await loadFonts();

  return await frames(async (ctx) => {
    const data = await getCampaignDetails(campaign)

    if (ctx.message?.transactionId) {

      const txnHash = ctx.message.transactionId

      if (txnHash) {
        const updateResponse = await supabase
          .from('Transactions')
          .update({ txn_hash: txnHash })
          .eq('campaign_id', campaign);

        if (updateResponse.error) {
          throw updateResponse.error;
        }
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
                justifyContent: "center",
                alignItems: "center",
                gap: "4px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <img
                style={{
                  objectFit: "cover",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
                tw="h-20 w-20"
                src={data.image_url}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  marginTop: "10px"
                }}
              >
                <span style={{ fontSize: "30px", fontFamily: "'Inter', sans-serif" }} tw="font-normal text-white">
                  You just bought BasedCoffee for
                </span>
                <span style={{ fontSize: "30px", fontFamily: "'Inter', sans-serif" }} tw="font-normal text-white">
                  {data.channel_name}
                </span>
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
          ],
        },
        buttons: [
          <Button
            action="link"
            target={`https://www.onceupon.gg/tx/${ctx.message.transactionId}`}
          >
            View on block explorer
          </Button>,
          <Button action="post" target={`/chan/f/${campaign}`}>
            See Goal
          </Button>,
          <Button action='link'
            key={"share"} target={`https://warpcast.com/~/compose?embeds[]=${env.HOST_URL}/frames/chan/f/${campaign}`}>
            Share Frame
          </Button>
        ],
      };
    }

    const amount = ctx.searchParams.amount;
    const customAmount = ctx.searchParams.customAmount
    const input = ctx.message?.inputText || ''

    const selectedAmount = customAmount ? parseInt(input) : parseInt(amount)

    const chain = "base"

    if (isNaN(selectedAmount)) {
      throw new Error('Invalid amount value'); // or handle the error as needed
    }

    const wallet = data.eth_address
    const fromFid = ctx.message && ctx.message.requesterFid
    const fromWallet = ctx.message && ctx.message.requesterVerifiedAddresses

    const coffee = parseFloat((selectedAmount * 0.0015).toFixed(4))
    const displayAmt = coffee + " ETH"


    const usd = selectedAmount * 5.5

    createTransactionRow(fromFid, fromWallet, data.lead_fid, wallet,
      coffee, chain, campaign, usd)

    return {
      image: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          <BgImage />
          <div
            style={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "4px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <img
              style={{
                objectFit: "cover",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
              tw="h-20 w-20"
              src={data.image_url}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                marginTop: "10px"
              }}
            >
              <span style={{
                fontSize: "25px",
                fontFamily: "'IntegralCF', sans-serif",
                fontWeight: "400", margin: "2px"
              }}
                tw="font-normal text-white">
                You are buying {selectedAmount} Coffee/s for
              </span>
              <span style={{ fontSize: "25px", fontFamily: "'IntegralCF', sans-serif", fontWeight: "400" }} tw="font-normal text-white">
                {data.channel_name}
              </span>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "10px"
                }}
              >
                <span style={{ fontSize: "30px", fontFamily: "'IntegralCF', sans-serif", fontWeight: "700" }} tw="font-normal text-white">
                  {displayAmt}
                </span>
                <img src={`${env.HOST_URL}/eth-logo.png`} alt="" tw="w-6 h-8 pb-2" style={{ display: "flex" }} />
              </div>
              <span style={{
                fontSize: "12px",
                fontFamily: "'IntegralCF', sans-serif",
                fontWeight: "400",
                width: "50px",
                height: "20px",
                backgroundColor: "#D98243",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }} tw="font-normal">
                ~$ {usd}
              </span>
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
        <Button action="tx" target={{
          pathname: `/chan/txdata`, query: { amount: coffee, wallet: wallet, chain: chain }
        }} post_url={`/chan/${campaign}/transaction`}>
          Buy Coffee
        </Button>,
        <Button action="post" target={`/chan/f/${campaign}`}>
          Go back
        </Button>,
      ]
      ,
    };
  })(req)
};

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/bgall.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;

async function getCampaignDetails(campaignId: string): Promise<Channel> {
  try {
    // Retrieve the campaign details
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', campaignId)
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


async function createTransactionRow(from_fid: any, from_wallet: any, to_fid: number, to_wallet: string,
  amt: number, chain: string, campaign_id: string, amt_usd: number) {
  try {
    // Test Supabase connection
    const { data: testData, error: testError } = await supabase
      .from('Transactions')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('Supabase connection test failed:', testError);
      throw testError;
    }

    // Prepare the row to insert
    const rowToInsert = {
      from_fid,
      from_wallet,
      to_fid,
      to_wallet,
      amt,
      chain,
      campaign_id,
      amt_usd,
    };

    console.log('Attempting to insert:', rowToInsert);

    // Insert the new row into the Supabase table
    const { data: insertedData, error: insertError } = await supabase
      .from('Transactions')
      .insert([rowToInsert]);

    if (insertError) {
      console.error('Supabase insertion error:', insertError);
      throw insertError;
    }

    console.log('Row created successfully:', insertedData);
    return insertedData;
  } catch (error) {
    console.error('Error creating transaction row:', error);
    throw error;
  }
}
