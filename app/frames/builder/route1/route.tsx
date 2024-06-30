import { loadFonts } from "@/app/utils/fontloader";
import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { env } from "process";

export const runtime = "edge";


const handleRequest = frames(async (ctx) => {
  const fonts = await loadFonts();

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
              support your frames on any Base, Degen or Arbitrium
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
      <Button action="post" target={`/builder/${fid}`}>
        Show My Frame
      </Button>,
      <Button action='link'
        key={"share"} target={`https://warpcast.com/~/compose?embeds[]=https://cryptocoffee-opal.vercel.app/frames/builder/${fid}`}>
        Share My Frame
      </Button>
    ]
    ,
  };
});

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/bgall.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;
