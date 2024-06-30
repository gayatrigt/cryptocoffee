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
  { params: { fid: routeFid } }: { params: { fid: string } }
) => {

  return await frames(async (ctx) => {
    const chain = ctx.searchParams.chain;
    console.log("🚀 ~ returnawaitframes ~ chain:", chain)

    let chainLabel = "ETH"
    let amount = "0.0015"
    let BgImageComponent = BgImage2

    if (chain == "degen") {
      chainLabel = "DEGEN"
      amount = "300"
      BgImageComponent = BgImage1
    }

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
          <BgImageComponent />
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
              pathname: `/builder/${routeFid}/chain/transaction`, query: { amount: "1", chain: chain }
            }}
          >
            1
          </Button >,
          <Button
            action="post"
            target={{
              pathname: `/builder/${routeFid}/chain/transaction`, query: { amount: "2", chain: chain }
            }}
          >
            2
          </Button >,
          <Button
            action="post"
            target={{
              pathname: `/builder/${routeFid}/chain/transaction`, query: { amount: "5", chain: chain }
            }}
          >
            5
          </Button >,
          <Button action="post" target={{
            pathname: `/builder/${routeFid}/chain`,
            query: { custom: true, chain }
          }}>
            Custom
          </Button>, ,
        ] : [
          <Button
            action="post"
            target={{
              pathname: `/builder/${routeFid}/chain/transaction`, query: { chain: chain, customAmount: true }
            }}
          >
            Buy Coffee
          </Button >
        ]
      ,
    };
  })(req)
};

function BgImage1({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/degen.png`} alt="background" width={width} tw={tw} />;
}

function BgImage2({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/price.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;
