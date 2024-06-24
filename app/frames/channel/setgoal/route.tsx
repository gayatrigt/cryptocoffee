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
          <div style={
            {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }
          }>
            <span style={
              {
                fontSize: "40px"
              }
            } tw="font=bold" > Describe Channel Goal
            </span>
          </div>
        </div>
      </div>
    ),
    textInput: "Write the goal in short",
    buttons: [
      <Button action="post" target={{
        pathname: "/channel/setamount", query: { channel: channel }
      }}
      >
        Confirm
      </Button >
    ]
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
