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
              src={data.users[0].pfp_url}
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
              <span style={{ fontSize: "30px", fontFamily: "'IntegralCF', sans-serif", }} tw="font-bold text-white">
                Say Thanks To
              </span>
              <span style={{ fontSize: "30px", fontFamily: "'IntegralCF', sans-serif", }} tw="font-bold text-white">
                {data.users[0].username}
              </span>
              <span style={{ fontSize: "16px" }} tw="font-normal text-white">
                Select a Chain to Buy a Coffee
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
        <Button
          action="post"
          target={{
            pathname: `/builder/${routeFid}/chain`, query: { chain: "base" }
          }}
        >
          Base
        </Button >,
        <Button
          action="post"
          target={{
            pathname: `/builder/${routeFid}/chain`, query: { chain: "art" }
          }}
        >
          Arbitrium
        </Button >,
        <Button
          action="post"
          target={{
            pathname: `/builder/${routeFid}/chain`, query: { chain: "degen" }
          }}
        >
          DEGEN
        </Button >,
      ]
      ,
    };
  })(req)
};

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/chain-three.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;
