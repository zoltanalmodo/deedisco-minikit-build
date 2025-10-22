import { useState, useEffect } from 'react';

export interface MiniAppContext {
  isMiniApp: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useMiniAppContext(): MiniAppContext {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectMiniApp = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if we're in a Mini App context
        // Method 1: Check for Farcaster Mini App SDK
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined' && (window as any).farcaster) {
          setIsMiniApp(true);
          return;
        }

        // Method 2: Check for Warpcast user agent or specific context
        if (typeof window !== 'undefined') {
          const userAgent = navigator.userAgent.toLowerCase();
          const isWarpcast = userAgent.includes('warpcast') || 
                           userAgent.includes('farcaster');
          
          if (isWarpcast) {
            setIsMiniApp(true);
            return;
          }
        }

        // Method 3: Check for Mini App specific environment variables or context
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined' && (window as any).__FARCASTER_MINI_APP__) {
          setIsMiniApp(true);
          return;
        }

        // Default to browser mode
        setIsMiniApp(false);
      } catch (err) {
        console.error('Error detecting Mini App context:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsMiniApp(false);
      } finally {
        setIsLoading(false);
      }
    };

    detectMiniApp();
  }, []);

  return {
    isMiniApp,
    isLoading,
    error
  };
}
