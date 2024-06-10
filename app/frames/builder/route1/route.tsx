import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";

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
});

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
              In just a couple of taps, your fans can make the payment (buy you a coffee) and
              support your frames!
            </span>
          </div>
        </div>
      </div>
    ),
    buttons: [
      <Button action="post" target={`/builder/${fid}`}>
        Show My Frame
      </Button>,
      <Button action='link'
        key={"share"} target={`https://warpcast.com/~/compose?embeds[]=https://www.farcasterworth.com/frames/builder/${fid}`}>
        Share My Frame
      </Button>
    ]
    ,
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
