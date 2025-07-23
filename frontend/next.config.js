/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  output: 'export',
  distDir: 'out',
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  env: {
    DFX_NETWORK: process.env.DFX_NETWORK || 'local',
    CANISTER_ID_MARKETPLACE: process.env.CANISTER_ID_MARKETPLACE,
    CANISTER_ID_ASSETS: process.env.CANISTER_ID_ASSETS,
    CANISTER_ID_USERS: process.env.CANISTER_ID_USERS,
  },
}

module.exports = nextConfig
