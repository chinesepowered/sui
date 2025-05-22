/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    "@mysten/sui.js",
    "@mysten/wallet-kit"
  ],
};

module.exports = nextConfig; 