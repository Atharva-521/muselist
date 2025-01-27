import type { NextConfig } from "next";
// @ts-check
 
/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
};

console.log("Next.js Configuration:", nextConfig.images?.remotePatterns);

export default nextConfig;
