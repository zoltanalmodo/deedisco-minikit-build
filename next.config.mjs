/** @type {import('next').NextConfig} */
const nextConfig = {
  // Silence warnings
  // https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Suppress punycode deprecation warning
    config.ignoreWarnings = [
      /punycode/,
      /Critical dependency: the request of a dependency is an expression/,
    ];
    
    // Disable webpack cache to prevent warnings
    config.cache = false;
    
    return config;
  },
  
  // Suppress console warnings in production
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Fix iframe embedding for Farcaster Mini App
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: '',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://farcaster.xyz https://warpcast.com https://*.farcaster.xyz https://*.warpcast.com https://*.vercel.app; connect-src 'self' https://farcaster.xyz https://client.farcaster.xyz https://warpcast.com https://client.warpcast.com https://wrpcd.net https://*.wrpcd.net https://privy.farcaster.xyz https://privy.warpcast.com https://auth.privy.io https://*.rpc.privy.systems https://cloudflareinsights.com https://explorer-api.walletconnect.com https://pulse.walletconnect.org https://*.walletconnect.com https://*.reown.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
