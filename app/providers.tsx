"use client";

import { type ReactNode, useEffect } from "react";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../lib/wagmi-config';
import { sdk } from '@farcaster/miniapp-sdk';

const queryClient = new QueryClient();

// Component to handle Farcaster SDK ready() call - EXACTLY as per documentation
function FarcasterReadyHandler() {
  useEffect(() => {
    console.log('🚀 FarcasterReadyHandler: Attempting to call sdk.actions.ready()');
    
    // Use the EXACT pattern from official documentation
    const callReady = async () => {
      try {
        console.log('✅ Calling sdk.actions.ready() as per documentation');
        await sdk.actions.ready();
        console.log('✅ Successfully called sdk.actions.ready()');
      } catch (error) {
        console.error('❌ Error calling sdk.actions.ready():', error);
      }
    };

    // Call ready after component mounts
    callReady();
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
