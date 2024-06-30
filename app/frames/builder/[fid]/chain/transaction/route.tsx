import { loadFonts } from "@/app/utils/fontloader";
import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { NextRequest } from "next/server";
import { env } from "process";

export type State = {
  chain: string;
};

export const runtime = "edge";

const handleRequest = async (
  req: NextRequest,
  { params: { fid: routeFid } }: { params: { fid: string } }
) => {

  const fonts = await loadFonts();

  return await frames(async (ctx) => {
    const response = await fetch(`https://cryptocoffee-opal.vercel.app/api/user-details?fid=${routeFid}`);
    const data = await response.json();

    if (ctx.message?.transactionId) {

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
            <div style={{
              position: "absolute",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "4px",
              padding: "20px",
              textAlign: "center",
            }}>
              <span style={
                {
                  fontSize: "25px",
                  fontFamily: "'IntegralCF', sans-serif",
                  fontWeight: "400", margin: "2px"
                }
              } tw="font-normal text-white" >
                You just bought coffee for
              </span>
              <span style={
                {
                  fontSize: "25px",
                  fontFamily: "'IntegralCF', sans-serif",
                  fontWeight: "400", margin: "2px"
                }
              } tw="font-normal text-white" >
                {data.users[0].display_name}
              </span>
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
          <Button
            action="link"
            target={`https://www.onceupon.gg/tx/${ctx.message.transactionId}`}
          >
            View on block explorer
          </Button>,
        ],
      };
    }


    const amount = ctx.searchParams.amount;
    const customAmount = ctx.searchParams.customAmount
    const input = ctx.message?.inputText || ''

    const selectedAmount = customAmount ? parseInt(input) : parseInt(amount)

    const chain = ctx.searchParams.chain;

    let coffee = 0;
    let displayAmt = ""

    if (isNaN(selectedAmount)) {
      throw new Error('Invalid amount value'); // or handle the error as needed
    }

    const wallet = data.users[0].verified_addresses.eth_addresses[0]

    console.log("🚀 ~ returnawaitframes ~ chain == DEGEN:", chain == "degen")
    if (chain == "degen") {
      coffee = selectedAmount * 300
      displayAmt = coffee + " DEGEN"
    } else {
      coffee = parseFloat((selectedAmount * 0.0015).toFixed(4))
      displayAmt = coffee + " ETH"
    }

    const usd = selectedAmount * 5.5

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
          <div style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
            padding: "20px",
            textAlign: "center",
          }}>
            <div style={
              {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                marginTop: "10px"
              }
            }>
              <span style={
                {
                  fontSize: "25px",
                  fontFamily: "'IntegralCF', sans-serif",
                  fontWeight: "400", margin: "2px"
                }
              } tw="font-normal text-white" >
                You are buying {selectedAmount} Coffee for

              </span>
              <span style={
                {
                  fontSize: "25px",
                  fontFamily: "'IntegralCF', sans-serif",
                  fontWeight: "400", margin: "2px"
                }
              } tw="font-normal text-white" >

                {data.users[0].display_name}
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
              </div>
              <span style={
                {
                  fontSize: "16px",
                  fontFamily: "'IntegralCF', sans-serif",
                  fontWeight: "400",
                  width: "50px",
                  height: "20px",
                  backgroundColor: "#D98243",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }
              } tw="font=normal" >
                ~${usd}
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
          pathname: `/builder/txdata`, query: { amount: coffee, wallet: wallet, chain: chain }
        }} post_url={`/builder/${routeFid}/chain/transaction`}>
          Buy Coffee
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
