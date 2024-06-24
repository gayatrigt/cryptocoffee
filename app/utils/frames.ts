import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";

export const frames = createFrames({
    basePath: '/frames',
    middleware: [
        farcasterHubContext({
            hubHttpUrl: "https://hubs.airstack.xyz",
            hubRequestOptions: {
                headers: {
                    "x-airstack-hubs": process.env.AIRSTACK_API_KEY as string,
                },
            },
        }),
    ],
    initialState: {
        chain: "",
    },
});