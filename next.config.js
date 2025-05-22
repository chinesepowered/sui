/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@mysten/sui.js",
    "@mysten/dapp-kit"
  ],
};

module.exports = nextConfig; 