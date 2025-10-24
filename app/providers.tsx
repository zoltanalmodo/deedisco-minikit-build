"use client";

import { type ReactNode, useEffect } from "react";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../lib/wagmi-config';

const queryClient = new QueryClient();

// Extend Window interface for Farcaster
declare global {
  interface Window {
    farcaster?: {
      ready: () => void;
    };
  }
}

// Component to handle Farcaster Frame ready() call
function FarcasterReadyHandler() {
  useEffect(() => {
    console.log('🚀 FarcasterReadyHandler: Attempting to call ready()');
    
    // Method 1: Try to access the Farcaster SDK from window
    if (typeof window !== 'undefined') {
      // Check if we're in a Farcaster environment
      if (window.parent !== window) {
        console.log('✅ Detected Farcaster environment (iframe)');
        
        // Try multiple approaches to call ready()
        try {
          // Approach 1: Direct ready call if available
          if (window.farcaster && typeof window.farcaster.ready === 'function') {
            window.farcaster.ready();
            console.log('✅ Called window.farcaster.ready()');
            return;
          }
          
          // Approach 2: PostMessage to parent
          window.parent.postMessage({ type: 'ready' }, '*');
          console.log('✅ Sent ready postMessage to parent');
          
          // Approach 3: Try parent.farcaster
          if (window.parent.farcaster && typeof window.parent.farcaster.ready === 'function') {
            window.parent.farcaster.ready();
            console.log('✅ Called parent.farcaster.ready()');
          }
          
        } catch (error) {
          console.error('❌ Error calling ready():', error);
        }
      } else {
        console.log('⚠️ Not in Farcaster environment (not iframe)');
      }
    }
  }, []);

  return null;
}

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <FarcasterReadyHandler />
        {props.children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
