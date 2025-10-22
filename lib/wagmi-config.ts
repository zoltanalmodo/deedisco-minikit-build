import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { metaMask, coinbaseWallet } from 'wagmi/connectors';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';

// Always use BASE Sepolia testnet for development
const selectedChain = baseSepolia;

// For now, always use browser connectors for testing
// TODO: Add proper Mini App detection later
const connectors = [
  metaMask(), // Browser: Use MetaMask
  coinbaseWallet({ 
    appName: 'Deedisco Minikit',
    appLogoUrl: '/logo.png'
  }), // Browser: Use Coinbase Wallet
  farcasterMiniApp() // Also include Farcaster for Mini App support
];

export const wagmiConfig = createConfig({
  chains: [selectedChain],
  connectors,
  transports: {
    [selectedChain.id]: http(),
  },
});

// Export isMiniAppContext for compatibility (always false for now)
export const isMiniAppContext = false;
