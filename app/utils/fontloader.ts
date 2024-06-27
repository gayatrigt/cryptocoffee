// src/utils/fontLoader.ts

let cachedFonts: { [key: string]: ArrayBuffer } | null = null;

export async function loadFonts(): Promise<{ [key: string]: ArrayBuffer }> {
    if (cachedFonts) return cachedFonts;

    const fontUrls = {
        interRegular: new URL("/public/inter/Inter-Regular.ttf", import.meta.url),
        interBold: new URL("/public/inter/Inter-Bold.ttf", import.meta.url),
        integralBold: new URL("/public/integral/IntegralCF-Bold.ttf", import.meta.url),
        integralRegular: new URL("/public/integral/IntegralCF-Regular.ttf", import.meta.url),
    };

    const loadedFonts: { [key: string]: ArrayBuffer } = {};

    for (const [name, url] of Object.entries(fontUrls)) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load font: ${name}`);
            loadedFonts[name] = await response.arrayBuffer();
        } catch (error) {
            console.error(`Error loading font ${name}:`, error);
            // Provide a fallback empty ArrayBuffer if loading fails
            loadedFonts[name] = new ArrayBuffer(0);
        }
    }

    cachedFonts = loadedFonts;
    return loadedFonts;
}