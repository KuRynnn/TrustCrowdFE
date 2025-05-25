import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: 'http://localhost:8000/storage/:path*', // Adjust this URL to your Laravel backend URL
      },
    ];
  },
};

export default nextConfig;