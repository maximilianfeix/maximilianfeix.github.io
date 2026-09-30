import type { NextConfig } from "next";

// A plain static export: GitHub Pages serves the `out/` folder as it is.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
