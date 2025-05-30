import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactStrictMode: true,
  output: 'standalone',
  // Your other Next.js config options
  // reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: false, // Set to true if you want to bypass TS errors
  },
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