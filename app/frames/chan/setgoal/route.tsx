import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { env } from "process";

const handleRequest = frames(async (ctx) => {


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
      </div>
    ),
    imageOptions: {
      width: 650,
      height: 356,
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

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/goal.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;