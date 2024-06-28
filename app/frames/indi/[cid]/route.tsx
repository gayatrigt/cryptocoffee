import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { NextRequest } from "next/server";
import { env } from "process";

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
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <BgImage />
        </div>
      ),
      imageOptions: {
        width: 650,
        height: 356,
      },
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

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/price.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;
