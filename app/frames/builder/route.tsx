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
          width: "70%",
          alignItems: "center",
          textAlign: "center",
          fontSize: "52",
          fontWeight: "bold"
        }}
      >
        Fuel your Frames with some Crypto Coffee
        <span style={{
          fontSize: "24",
        }}>
          Give your audience
          an easy way to say thanks
        </span>
      </div>
    ),
    buttons: [
      <Button action="post" target="/builder/route1">
        Get Started
      </Button>,
    ]
    ,
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
