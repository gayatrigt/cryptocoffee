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
    const response = await fetch(`https://cryptocoffee-opal.vercel.app/api/user-details?fid=${routeFid}`);
    const data = await response.json();

    if (ctx.message?.transactionId) {
      return {
        image: (
          <div tw="text-black w-full h-full justify-center items-center flex">
            You just bought coffee for {data.users[0].display_name}
          </div>
        ),
        buttons: [
          <Button
            action="link"
            target={`https://www.onceupon.gg/tx/${ctx.message.transactionId}`}
          >
            View on block explorer
          </Button>,
        ],
      };
    }

    const amount = parseFloat(ctx.searchParams.amount);
    const chain = ctx.searchParams.chain;
    console.log("🚀 ~ returnawaitframes ~ chain:", chain)

    let coffee = 0;
    let displayAmt = ""

    if (isNaN(amount)) {
      throw new Error('Invalid amount value'); // or handle the error as needed
    }

    const wallet = data.users[0].verified_addresses.eth_addresses[0]

    if (chain == "DEGEN") {
      coffee = amount * 300
      displayAmt = coffee + " DEGEN"
    } else {
      coffee = amount * 0.0015
      displayAmt = coffee + " ETH"
    }

    const usd = amount * 5.5

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
                  fontSize: "30px"
                }
              } tw="font=bold" >
                You are buying {amount} Coffee for {data.users[0].display_name}
              </span>
              <span style={
                {
                  fontSize: "50px",
                  marginTop: "30px"
                }
              } tw="font=bold" >
                {displayAmt}
              </span>
              <span style={
                {
                  fontSize: "30px",
                  marginTop: "5px"
                }
              } tw="font=normal" >
                (${usd})
              </span>
            </div>
          </div>
        </div>
      ),
      buttons: [
        <Button action="tx" target={{
          pathname: `/builder/txdata`, query: { amount: coffee, wallet: wallet, chain: chain }
        }} post_url={`/builder/${routeFid}/chain/transaction`}>
          Buy Coffee
        </Button>,
      ]
      ,
    };
  })(req)
};

export const GET = handleRequest;
export const POST = handleRequest;
