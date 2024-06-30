import { loadFonts } from "@/app/utils/fontloader";
import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { env } from "process";

const handleRequest = frames(async (ctx) => {

  const fid = ctx.message?.requesterFid

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
      </div>
    ),
    imageOptions: {
      width: 650,
      height: 356,
    },
    textInput: "Write your goal for funding",
    buttons: [
      <Button action="post" target={{
        pathname: "/indi/setamount", query: { fid: fid }
      }}
      >
        Set Goal
      </Button >,
    ]
    ,
  };
});

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/goal-indi.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;
