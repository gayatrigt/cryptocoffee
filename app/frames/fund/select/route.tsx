import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
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


const handleRequest = frames(async (ctx) => {
  const [interRegularFontData, interBoldFontData, integralBoldFontData] =
    await Promise.all([interRegularFont, interBoldFont, integralBoldFont]);

  const fid = ctx.message?.requesterFid

  const name = ctx.message?.requesterUserData?.displayName
  const pfp = ctx.message?.requesterUserData?.profileImage

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
            src={pfp}
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
              Hey {name}
            </span>
            <span style={{ fontSize: "16px" }} tw="font-normal text-white">
              Let your followers help you
            </span>
            <span style={{ fontSize: "16px" }} tw="font-normal text-white">
              meet your goals with Degen tips or ETH!
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
      <Button action="post" target={`/indi`}>
        Get for My Self
      </Button>,
      <Button action="post" target={`/chan`}>
        Get for My Channel
      </Button>,
    ]
    ,
  };
});

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/chain.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;
