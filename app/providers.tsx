"use client";

import { type ReactNode, useEffect } from "react";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../lib/wagmi-config';
import { sdk } from '@farcaster/miniapp-sdk';

const queryClient = new QueryClient();

// Extend Window interface for Farcaster
declare global {
  interface Window {
    farcaster?: {
      ready: () => void;
    };
  }
}

// Component to handle Farcaster SDK ready() call with comprehensive error handling
function FarcasterReadyHandler() {
  useEffect(() => {
    console.log('🚀 FarcasterReadyHandler: Attempting to call sdk.actions.ready()');
    
    // Use the EXACT pattern from official documentation with enhanced error handling
    const callReady = async () => {
      try {
        console.log('✅ Checking SDK availability...');
        console.log('SDK object:', sdk);
        console.log('SDK actions:', sdk?.actions);
        
        if (!sdk || !sdk.actions) {
          console.error('❌ SDK or sdk.actions not available');
          return;
        }
        
        console.log('✅ Calling sdk.actions.ready() as per documentation');
        await sdk.actions.ready();
        console.log('✅ Successfully called sdk.actions.ready()');
      } catch (error) {
        console.error('❌ Error calling sdk.actions.ready():', error);
        
        // Fallback: Try alternative approaches
        console.log('🔄 Attempting fallback ready() methods...');
        
        // Fallback 1: Try window.farcaster.ready()
        if (typeof window !== 'undefined' && window.farcaster) {
          try {
            window.farcaster.ready();
            console.log('✅ Fallback: Called window.farcaster.ready()');
          } catch (fallbackError) {
            console.error('❌ Fallback window.farcaster.ready() failed:', fallbackError);
          }
        }
        
        // Fallback 2: Try postMessage
        try {
          window.parent.postMessage({ type: 'ready' }, '*');
          console.log('✅ Fallback: Sent ready postMessage');
        } catch (postError) {
          console.error('❌ Fallback postMessage failed:', postError);
        }
      }
    };

    // Call ready after component mounts with delay to ensure SDK is loaded
    setTimeout(callReady, 100);
    setTimeout(callReady, 500);
    setTimeout(callReady, 1000);
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
