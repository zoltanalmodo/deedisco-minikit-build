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
};

export default nextConfig;
