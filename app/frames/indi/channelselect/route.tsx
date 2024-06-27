import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { env } from "process";

const handleRequest = frames(async (ctx) => {

  const channel = ctx.message?.inputText

  const response = await fetch(`${env.HOST_URL}/api/channel-details?cid=${channel}`);
  const data = await response.json();

  console.log(data)

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
          <img
            style={
              {
                objectFit: "cover",
              }
            }
            tw='h-24 w-24 rounded-full '
            src={data.channels[0].image_url}
          />
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
            } tw="font=bold" > {data.channels[0].name}
            </span>
            <span style={
              {
                fontSize: "24px",
                marginTop: "30px"
              }
            } tw="font=normal" >
              Confirm to get paid to wallet associated with @{data.channels[0].lead.username}
            </span>
          </div>
        </div>
      </div>
    ),
    buttons: [
      <Button action="post" target={{
        pathname: "/channel/setgoal", query: { channel: data.channels[0].id }
      }}
      >
        Confirm
      </Button >,
      <Button action="post" target="/channel/channelsearch" >
        Search Again
      </Button >
    ]
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
