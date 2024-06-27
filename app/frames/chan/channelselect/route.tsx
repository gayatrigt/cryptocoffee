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

  const channel = ctx.message?.inputText

  const response = await fetch(`${env.HOST_URL}/api/channel-details?cid=${channel}`);
  const data = await response.json();

  console.log(data)

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
            <img
              style={{
                objectFit: "cover",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
              tw='h-24 w-24'
              src={data.channels[0].image_url}
            />
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
                marginTop: "10px"
              }} tw="font-bold">
                {data.channels[0].name}
              </span>
              <span style={{
                fontSize: "20px",
                marginTop: "20px",
                fontFamily: "'Inter', sans-serif",
                color: "white",
              }} tw="font-normal">
                Confirm to get paid to wallet associated with @{data.channels[0].lead.username}
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
    buttons: [
      <Button action="post" target={{
        pathname: "/chan/setgoal", query: { channel: data.channels[0].id }
      }}>
        Confirm
      </Button>,
      <Button action="post" target="/chan/channelsearch">
        Search Again
      </Button>
    ]
  };
});

export function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/bgall.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;