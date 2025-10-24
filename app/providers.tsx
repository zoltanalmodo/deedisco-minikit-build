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
    console.log('🌍 Window location:', window.location.href);
    console.log('🌍 Parent window:', window.parent !== window);
    console.log('🌍 Top window:', window.top !== window);
    console.log('🌍 User agent:', navigator.userAgent);
    console.log('🌍 Referrer:', document.referrer);
    
    // Use the EXACT pattern from official documentation with enhanced error handling
    const callReady = async () => {
      try {
        console.log('✅ Checking SDK availability...');
        console.log('SDK object:', sdk);
        console.log('SDK actions:', sdk?.actions);
        console.log('Window object keys:', Object.keys(window));
        console.log('Parent window available:', !!window.parent);
        
        if (!sdk || !sdk.actions) {
          console.error('❌ SDK or sdk.actions not available');
          console.log('Available window properties:', Object.getOwnPropertyNames(window));
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
        
        // Fallback 3: Try direct function call
        try {
          if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).farcasterReady) {
            ((window as unknown as Record<string, unknown>).farcasterReady as () => void)();
            console.log('✅ Fallback: Called window.farcasterReady()');
          }
        } catch (directError) {
          console.error('❌ Direct ready call failed:', directError);
        }
      }
    };

    // Call ready after component mounts with delay to ensure SDK is loaded
    setTimeout(callReady, 100);
    setTimeout(callReady, 500);
    setTimeout(callReady, 1000);
    setTimeout(callReady, 2000);
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
