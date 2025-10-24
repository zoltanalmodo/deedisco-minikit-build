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

// Component to handle sdk.actions.ready() call
function MiniAppReadyHandler() {
  useEffect(() => {
    // Call ready() using the global Farcaster SDK
    if (typeof window !== 'undefined' && window.farcaster) {
      console.log('🚀 Calling window.farcaster.ready() for Farcaster Mini App');
      window.farcaster.ready();
    } else {
      console.log('🚀 Calling ready() via script injection for Farcaster Mini App');
      // Fallback: inject the ready call
      const script = document.createElement('script');
      script.textContent = 'if (window.farcaster) { window.farcaster.ready(); }';
      document.head.appendChild(script);
    }
  }, []);

  return null;
}

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniAppReadyHandler />
        {props.children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
