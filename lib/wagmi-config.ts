import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// Use BASE testnet (Sepolia) for development
const isTestnet = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_TESTNET === 'true';
const selectedChain = isTestnet ? baseSepolia : base;

// Check if we're in a Mini App context
const isMiniAppContext = typeof window !== 'undefined' && (
  (window as any).farcaster ||
  navigator.userAgent.toLowerCase().includes('warpcast') ||
  navigator.userAgent.toLowerCase().includes('farcaster') ||
  (window as any).__FARCASTER_MINI_APP__
);

// Create connectors based on context
const connectors = isMiniAppContext
  ? [farcasterMiniApp()] // Mini App: Use Farcaster connector
  : [
      metaMask(), // Browser: Use MetaMask
      coinbaseWallet({ 
        appName: 'Deedisco Minikit',
        appLogoUrl: '/logo.png'
      }) // Browser: Use Coinbase Wallet
    ];

export const wagmiConfig = createConfig({
  chains: [selectedChain],
  connectors,
  transports: {
    [selectedChain.id]: http(),
  },
});

export { isMiniAppContext };
