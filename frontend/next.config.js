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
  
  // Disable server-side rendering for pages that use ICP services
  experimental: {
    esmExternals: false,
  },
  
  webpack: (config, { isServer }) => {
    // Fallback configuration for Node.js modules not available in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    };

    // Exclude ICP dependencies from server-side bundle to prevent indexedDB errors
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@dfinity/auth-client': 'commonjs @dfinity/auth-client',
        '@dfinity/agent': 'commonjs @dfinity/agent',
        '@dfinity/principal': 'commonjs @dfinity/principal',
        '@dfinity/candid': 'commonjs @dfinity/candid',
      });
    }

    // Handle WebAssembly modules
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
  
  env: {
    DFX_NETWORK: process.env.DFX_NETWORK || 'local',
    CANISTER_ID_MARKETPLACE: process.env.CANISTER_ID_MARKETPLACE,
    CANISTER_ID_ASSETS: process.env.CANISTER_ID_ASSETS,
    CANISTER_ID_USERS: process.env.CANISTER_ID_USERS,
    CANISTER_ID_FRONTEND: process.env.CANISTER_ID_FRONTEND,
  },

  // Note: Custom headers are not supported with output: 'export'
  // Headers would be configured in the web server serving the static files
}

module.exports = nextConfig
