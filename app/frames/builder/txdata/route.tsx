import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { transaction } from "frames.js/core";
import { parseUnits } from 'ethers';

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

const chainIdMap: Record<string, number> = {
    base: 8453,
    degen: 666666666,
    art: 42161
}

const handleRequest = frames(async (ctx) => {
    const amount = parseFloat(ctx.searchParams.amount);
    const chain = ctx.searchParams.chain;
    console.log("🚀 ~ handleRequest ~ chain:", chain)
    const wallet = ctx.searchParams.wallet

    console.log("🚀 ~ handleRequest ~ amount:", amount)

    const chainId = chainIdMap[chain]
    // const value = amount * 1e18
    const value = parseUnits(String(amount), "ether")

    return transaction({
        chainId: `eip155:${chainId}`,
        method: "eth_sendTransaction",
        params: {
            abi: [],
            to: wallet as any,
            value: String(value),
        },
    });
});

export const GET = handleRequest;
export const POST = handleRequest;
