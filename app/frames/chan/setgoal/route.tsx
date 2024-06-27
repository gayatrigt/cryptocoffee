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

  const channel = ctx.searchParams.channel

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
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}>
              <span style={{
                fontSize: "40px",
                fontFamily: "'IntegralCF', sans-serif",
                color: "white",
              }} tw="font-bold">
                Describe Channel Goal
              </span>
              <span style={{
                fontSize: "20px",
                marginTop: "6px",
                fontFamily: "'Inter', sans-serif",
                color: "white",
              }} tw="font-normal">
                This will tell your supporters, for what you are raising the fund for
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
    textInput: "Write the goal in short",
    buttons: [
      <Button action="post" target={{
        pathname: "/chan/setamount", query: { channel: channel }
      }}>
        Confirm
      </Button>
    ]
  };
});

export function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/bgall.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;