import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid incorrect root inference when other lockfiles exist above this folder.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
