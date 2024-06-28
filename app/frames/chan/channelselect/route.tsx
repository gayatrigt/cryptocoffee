import { loadFonts } from "@/app/utils/fontloader";
import { frames } from "@/app/utils/frames";
import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { env } from "process";

export const runtime = "edge";

const handleRequest = frames(async (ctx) => {
  const fonts = await loadFonts();

  const channel = ctx.message?.inputText

  const response = await fetch(`${env.HOST_URL}/api/channel-details?cid=${channel}`);
  const data = await response.json();

  console.log(data)

  if (!data || !data.channels || data.channels.length === 0 || data.error) {
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
          <BgImage />
          <div style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "4px",
            padding: "20px",
            textAlign: "center",
          }}>
            <span style={
              {
                fontSize: "40px",
                fontFamily: "'Inter', sans-serif"
              }
            } tw="font=normal text-white" >
              Channel does not exist or username is incorrect
            </span>
          </div>
        </div>
      ),
      buttons: [
        <Button action="post" target={`/chan`}>
          Search Again 🔍
        </Button >
      ]
    };
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
        <BgImage />
        <div style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "4px",
          padding: "20px",
          textAlign: "center",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center"
          }}
          >
            <img
              style={{
                objectFit: "cover",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              }}
              tw="h-10 w-10"
              src={data.channels[0].image_url}
            />
            <span style={
              {
                fontSize: "18px",
                fontFamily: "'Inter', sans-serif",
                marginLeft: "4px"
              }
            } tw="font=normal text-white" >
              /{data.channels[0].id}
            </span>
          </div>
          <div style={
            {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              marginTop: "20px"
            }
          }>
            <span style={
              {
                fontSize: "30px",
                fontFamily: "'IntegralCF', sans-serif"
              }
            } tw="font=bold text-white" > {data.channels[0].name}
            </span>
            <span style={
              {
                fontSize: "16px",
                marginTop: "10px",
                fontFamily: "'Inter', sans-serif"
              }
            } tw="font=normal text-white" >
              Confirm to get paid to wallet associated with @{data.channels[0].lead.username}
            </span>
          </div>
        </div>
      </div>
    ),
    imageOptions: {
      width: 650,
      height: 356,
      fonts: [
        {
          name: "Inter",
          data: fonts.interRegular,
          weight: 400,
        },
        {
          name: "Inter",
          data: fonts.interBold,
          weight: 700,
        },
        {
          name: "IntegralCF",
          data: fonts.integralBold,
          weight: 700,
        },
      ],
    },
    buttons: [
      <Button action="post" target={{
        pathname: "/chan/setgoal", query: { channel: data.channels[0].id }
      }}
      >
        Confirm
      </Button >,
      <Button action="post" target={`/chan`}>
        Search Again 🔍
      </Button >
    ]
  };
});

function BgImage({ width = '100%', tw }: { width?: string; tw?: string }) {
  return <img src={`${env.HOST_URL}/bgplain.png`} alt="background" width={width} tw={tw} />;
}

export const GET = handleRequest;
export const POST = handleRequest;
