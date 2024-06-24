import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";

export type State = {
  chain: string;
};

const handleRequest = frames(async (ctx) => {

  return {
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundImage: `url("https://cryptocoffee-opal.vercel.app/bg.png")`,
          height: "588px",
          width: "1135px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
      </div>
    ),
    buttons: [
      <Button action="post" target="/channel/channelsearch">
        Get Started
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
