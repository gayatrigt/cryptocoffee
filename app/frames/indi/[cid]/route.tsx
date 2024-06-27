import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { NextRequest } from "next/server";

export type State = {
  chain: string;
};

const handleRequest = async (
  req: NextRequest,
  { params: { cid: campaign } }: { params: { cid: string } }
) => {

  return await frames(async (ctx) => {

    const chainLabel = "ETH"
    const amount = "0.0001"

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
              } tw="font=bold" > 1 Coffee = {amount} {chainLabel}
              </span>
              <span style={
                {
                  fontSize: "20px"
                }
              } tw="font=light" > (~ $5.5)
              </span>
              <span style={
                {
                  fontSize: "30px",
                  marginTop: "30px"
                }
              } tw="font=normal" >
                How many coffee you want to buy?
              </span>
            </div>
          </div>
        </div>
      ),
      textInput: ctx.url.searchParams.has("custom") ? "How many cups of coffee?" : undefined,
      buttons: !ctx.url.searchParams.has("custom")
        ? [
          <Button
            action="post"
            target={{
              pathname: `/indi/${campaign}/transaction`, query: { amount: "1" }
            }}
          >
            1
          </Button >,
          <Button
            action="post"
            target={{
              pathname: `/indi/${campaign}/transaction`, query: { amount: "2" }
            }}
          >
            2
          </Button >,
          <Button
            action="post"
            target={{
              pathname: `/indi/${campaign}/transaction`, query: { amount: "5" }
            }}
          >
            5
          </Button >,
          <Button action="post" target={{
            pathname: `/channel/${campaign}`,
            query: { custom: true }
          }}>
            Custom
          </Button>, ,
        ] : [
          <Button
            action="post"
            target={{
              pathname: `/indi/${campaign}/transaction`, query: { customAmount: true }
            }}
          >
            Buy Coffee
          </Button >
        ]
      ,
    };
  })(req)
};

export const GET = handleRequest;
export const POST = handleRequest;
