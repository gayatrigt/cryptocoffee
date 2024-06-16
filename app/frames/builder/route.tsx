import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";

export type State = {
  chain: string;
};

const frames = createFrames({
  basePath: '/frames',
  middleware: [
    farcasterHubContext({
      hubHttpUrl: "https://hubs.airstack.xyz",
      hubRequestOptions: {
        headers: {
          "x-airstack-hubs": process.env.AIRSTACK_API_KEY as string,
        },
      },
    }),
  ],
  initialState: {
    chain: "",
  },
});

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
      <Button action="post" target="/builder/route1">
        Get Started
      </Button>,
    ],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
