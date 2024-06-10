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

    const response = await fetch(`http://localhost:3000/api/user-details?fid=${routeFid}`);
    const data = await response.json();

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
              src={data.users[0].pfp_url}
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
              } tw="font=bold" > Say thanks to {data.users[0].display_name}
              </span>
              <span style={
                {
                  fontSize: "24px",
                  marginTop: "30px"
                }
              } tw="font=normal" >
                Select a chain to buy a coffee
              </span>
            </div>
          </div>
        </div>
      ),
      buttons: [
        <Button
          action="post"
          target={{
            pathname: `/builder/${routeFid}/chain`, query: { chain: "base" }
          }}
        >
          Base
        </Button >,
        <Button
          action="post"
          target={{
            pathname: `/builder/${routeFid}/chain`, query: { chain: "art" }
          }}
        >
          Arbitrium
        </Button >,
        <Button
          action="post"
          target={{
            pathname: `/builder/${routeFid}/chain`, query: { chain: "degen" }
          }}
        >
          DEGEN
        </Button >,
      ]
      ,
    };
  })(req)
};

export const GET = handleRequest;
export const POST = handleRequest;
