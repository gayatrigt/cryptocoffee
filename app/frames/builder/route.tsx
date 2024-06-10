import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";

export type State = {
  chain: string;
};

const frames = createFrames({
  basePath: '/frames',
  middleware: [
    farcasterHubContext({
      // remove if you aren't using @frames.js/debugger or you just don't want to use the debugger hub
      ...(process.env.NODE_ENV === "production"
        ? {}
        : {
          hubHttpUrl: "http://localhost:3010/hub",
        }),
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
