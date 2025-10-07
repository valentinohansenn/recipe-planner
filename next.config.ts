import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Fix turbopack root warning
    turbopack: {
        root: __dirname,
    },
    // Ensure proper handling of client-side components
    experimental: {
        esmExternals: true,
    },
    // Optimize for AI SDK tools
    transpilePackages: [
        "@ai-sdk-tools/artifacts",
        "@ai-sdk-tools/store",
        "@ai-sdk-tools/devtools",
    ],
};

export default nextConfig;
