import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      "sodium-native": false, // WDK dependency - use JS fallback
    };
    
    // Handle native modules for server-side rendering
    if (isServer) {
      config.externals.push({
        "sodium-native": "commonjs sodium-native",
        "sodium-universal": "commonjs sodium-universal",
      });
    }
    
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

module.exports = nextConfig;
