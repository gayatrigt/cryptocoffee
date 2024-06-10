import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { NextRequest } from "next/server";

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

const handleRequest = async (
  req: NextRequest,
  { params: { fid: routeFid } }: { params: { fid: string } }
) => {

  return await frames(async (ctx) => {
    const chain = ctx.searchParams.chain;

    let chainLabel = "ETH"
    let amount = "0.0015"

    if (chain == "degen") {
      chainLabel = "DEGEN"
      amount = "300"
    }

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
      buttons: [
        <Button
          action="post"
          target={{
            pathname: `/builder/${routeFid}/chain/transaction`, query: { amount: "1", chain: chainLabel }
          }}
        >
          1
        </Button >,
        <Button
          action="post"
          target={{
            pathname: `/builder/${routeFid}/chain/transaction`, query: { amount: "2", chain: chainLabel }
          }}
        >
          2
        </Button >,
        <Button
          action="post"
          target={{
            pathname: `/builder/${routeFid}/chain/transaction`, query: { amount: "5", chain: chainLabel }
          }}
        >
          5
        </Button >,
        <Button
          action="post"
          target={{
            pathname: `/builder/${routeFid}/chain/transaction`, query: { amount: "10", chain: chainLabel }
          }}
        >
          10
        </Button >,
      ]
      ,
    };
  })(req)
};

export const GET = handleRequest;
export const POST = handleRequest;
