import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";

const handleRequest = frames(async (ctx) => {

  const fid = ctx.message?.requesterFid

  const name = ctx.message?.requesterUserData?.displayName
  const pfp = ctx.message?.requesterUserData?.profileImage

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
            tw='h-20 w-20 rounded-full '
            src={pfp}
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
                fontSize: "30px"
              }
            } tw="font=bold" > Hey {name},
            </span>
            <span style={
              {
                fontSize: "20px"
              }
            } tw="font=normal" >
              Buy Me a Coffee makes supporting fun and easy.
              In just a couple of taps, your channel followers can make the payment (buy you a coffee) and
              support you!
            </span>
          </div>
        </div>
      </div>
    ),
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

export const GET = handleRequest;
export const POST = handleRequest;
