/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@mysten/sui",
    "@mysten/dapp-kit"
  ],
};

module.exports = nextConfig; 