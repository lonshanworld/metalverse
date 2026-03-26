import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  basePath: "/org",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/org",
        permanent: true,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
