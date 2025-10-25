"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useMintPack } from "../../lib/hooks/useMintPack";

// Pack data - same as pack-selection page
const packData = [
  { id: 1, src: "/pack-all-random.png", alt: "All Random Pack", name: "All Random Pack" },
  { id: 2, src: "/pack-guaranteed-top.png", alt: "Guaranteed Top Pack", name: "Guaranteed Top Pack" },
  { id: 3, src: "/pack-guaranteed-mid.png", alt: "Guaranteed Middle Pack", name: "Guaranteed Middle Pack" },
  { id: 4, src: "/pack-guaranteed-bot.png", alt: "Guaranteed Bottom Pack", name: "Guaranteed Bottom Pack" },
]

function WalletSelectorContent() {
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useRealContract, setUseRealContract] = useState(false);
  const [mintingState, setMintingState] = useState<'idle' | 'minting' | 'confirming' | 'success' | 'error'>('idle');
  const [mintedNFTs, setMintedNFTs] = useState<Array<{
    tokenId: number;
    image: string;
    name: string;
    description: string;
  }> | null>(null);
  const [isActuallyConnected, setIsActuallyConnected] = useState(false);
  const [isOnBaseSepolia, setIsOnBaseSepolia] = useState(false);
  // const [networkName, setNetworkName] = useState<string>('');
  const [isMiniApp, setIsMiniApp] = useState(false);
  
  const searchParams = useSearchParams();
  const selectedPackIndex = parseInt(searchParams.get('pack') || '0');
  const selectedPack = packData[selectedPackIndex] || packData[0];
  
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { mintPack, isLoading: isMinting, isSuccess, error, selectedCards } = useMintPack();

  // Detect if running in Farcaster/Warpcast Mini App
  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    const detectMiniApp = () => {
      // Check for Farcaster Mini App environment
      const isFarcasterMiniApp = Boolean(
        // Check if we're in an iframe (Mini Apps run in iframes)
        window.self !== window.top ||
        // Check hostname patterns
        window.location.hostname.includes('warpcast.com') ||
        window.location.hostname.includes('farcaster.xyz') ||
        // Check user agent
        window.navigator.userAgent.includes('Farcaster') ||
        window.navigator.userAgent.includes('Warpcast') ||
        // Check for Mini App specific APIs
        ((window as unknown as { farcaster?: unknown }).farcaster ||
        (window as unknown as { warpcast?: unknown }).warpcast) ||
        // Check if we're in the Farcaster preview environment
        window.location.href.includes('farcaster.xyz') ||
        window.location.href.includes('warpcast.com')
      );
      
      console.log('🔍 Mini App detection:', {
        isIframe: window.self !== window.top,
        hostname: window.location.hostname,
        href: window.location.href,
        userAgent: window.navigator.userAgent,
        farcaster: (window as unknown as { farcaster?: unknown }).farcaster,
        warpcast: (window as unknown as { warpcast?: unknown }).warpcast,
        isFarcasterMiniApp
      });
      
      setIsMiniApp(isFarcasterMiniApp);
    };

    detectMiniApp();
  }, []);

  // Verify actual connection status and network
  useEffect(() => {
    // Only run on client side to prevent hydration issues
    if (typeof window === 'undefined') return;
    
    const verifyConnection = async () => {
      if (isConnected && address) {
        try {
          // Try to get accounts from the wallet to verify it's actually connected
          if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const isReallyConnected = accounts.length > 0 && accounts[0].toLowerCase() === address.toLowerCase();
            
            // Check network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const chainIdNumber = parseInt(chainId, 16);
            const isBaseSepolia = chainIdNumber === 84532; // Base Sepolia chain ID
            
            setIsActuallyConnected(isReallyConnected);
            setIsOnBaseSepolia(isBaseSepolia);
            
            // Network name logic removed (no longer needed)
          } else {
            setIsActuallyConnected(false);
            setIsOnBaseSepolia(false);
          }
        } catch {
          // If verification fails, but wagmi says connected, assume it's connected
          setIsActuallyConnected(true); // Trust wagmi if verification fails
          setIsOnBaseSepolia(false);
        }
      } else {
        setIsActuallyConnected(false);
        setIsOnBaseSepolia(false);
        // setNetworkName(''); // Removed - no longer needed
      }
    };

    verifyConnection();
  }, [isConnected, address]);

  // Function to fetch NFT metadata - REMOVED as we now use selectedCards directly

  // Watch for transaction confirmation with timeout fallback
  useEffect(() => {
    console.log('🔍 Wallet Selector transaction state:', {
      mintingState,
      isSuccess,
      isMinting,
      selectedCards: selectedCards?.length
    });
    
    if (mintingState === 'minting' && isSuccess) {
      console.log('✅ Transaction confirmed! Moving to success state...');
      // Fetch NFT metadata for the minted tokens using selected cards
      const fetchMintedNFTs = async () => {
        try {
          if (selectedCards && selectedCards.length > 0) {
            const nftPromises = selectedCards.map((cardIndex, i) => {
              // Map card index to actual image path
              const carousel = Math.floor(cardIndex / 8) + 1;
              const position = (cardIndex % 8) + 1;
              const imagePath = `/carousel${carousel}-image${position}.jpg`;
              
              return {
                tokenId: i + 1,
                image: imagePath,
                name: `Deedisco Card #${cardIndex + 1}`,
                description: `A unique trading card from carousel ${carousel}, position ${position}.`
              };
            });
            
            setMintedNFTs(nftPromises);
          } else {
            // Fallback to random cards if selectedCards not available
            setMintedNFTs([
              { tokenId: 1, image: '/carousel1-image1.jpg', name: 'Deedisco Card #1', description: 'A unique trading card.' },
              { tokenId: 2, image: '/carousel2-image1.jpg', name: 'Deedisco Card #2', description: 'A unique trading card.' },
              { tokenId: 3, image: '/carousel3-image1.jpg', name: 'Deedisco Card #3', description: 'A unique trading card.' }
            ]);
          }
        } catch {
          // Set fallback data
          setMintedNFTs([
            { tokenId: 1, image: '/carousel1-image1.jpg', name: 'Deedisco Card #1', description: 'A unique trading card.' },
            { tokenId: 2, image: '/carousel2-image1.jpg', name: 'Deedisco Card #2', description: 'A unique trading card.' },
            { tokenId: 3, image: '/carousel3-image1.jpg', name: 'Deedisco Card #3', description: 'A unique trading card.' }
          ]);
        }
      };
      
      fetchMintedNFTs();
      
      setMintingState('success');
      
      // Keep connected after successful minting - let user decide when to disconnect
    }
  }, [mintingState, isSuccess, disconnect, isMinting, selectedCards]);

  // Handle transaction errors (user rejection, network issues, etc.)
  useEffect(() => {
    if (mintingState === 'minting' && error) {
      setMintingState('idle'); // Go back to wallet selector
    }
  }, [mintingState, error]);

  // Handle wallet selection (NOT connection)
  const handleWalletSelect = (wallet: string) => {
    console.log('🎯 Wallet selected:', wallet);
    console.log('🔍 Current state:', { walletType, isMiniApp, isLoading });
    setWalletType(wallet);
  };

  // Handle actual wallet connection
  const handleWalletConnect = async () => {
    if (!walletType) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Log available connectors for debugging
      console.log('🔍 Available connectors:', connectors.map(c => ({ name: c.name, id: c.id })));
      
      const targetConnector = connectors.find(c => {
        if (walletType === 'coinbase') return c.name.toLowerCase().includes('coinbase');
        if (walletType === 'metamask') return c.name.toLowerCase().includes('metamask');
        if (walletType === 'warpcast') {
          // Check for Farcaster Mini App connector with multiple possible names
          return c.name.toLowerCase().includes('warpcast') || 
                 c.name.toLowerCase().includes('farcaster') ||
                 c.name.toLowerCase().includes('mini') ||
                 c.id.toLowerCase().includes('farcaster') ||
                 c.id.toLowerCase().includes('warpcast');
        }
        return false;
      });

      console.log('🎯 Target connector for', walletType, ':', targetConnector?.name, targetConnector?.id);

      if (targetConnector) {
        console.log('🔗 Attempting to connect with:', targetConnector.name, targetConnector.id);
        await connect({ connector: targetConnector });
        console.log('✅ Connection successful!');
      } else {
        console.error('❌ No connector found for wallet type:', walletType);
        console.error('Available connectors:', connectors.map(c => ({ name: c.name, id: c.id })));
      }
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle minting
  const handleMint = async () => {
    if (!isActuallyConnected && !(isConnected && address)) {
      return;
    }
    
    if (useRealContract) {
      // REAL CONTRACT MINTING
      setMintingState('minting');
      
      try {
        const result = await mintPack(selectedPackIndex);
        if (!result.success) {
          setMintingState('error');
        }
      } catch {
        setMintingState('error');
      }
    } else {
      // MOCK MINTING
      setMintingState('minting');
      
      // Simulate minting delay
      setTimeout(() => {
        setMintingState('success');
      }, 2000);
    }
  };

  // Show "Minting in progress" page while waiting for wallet confirmation
  if (mintingState === 'minting') {
    return (
      <main
        className="flex flex-col items-center w-full max-w-md mx-auto px-8 py-4 bg-white text-black"
        style={{ minHeight: "100vh", overflowY: "auto" }}
      >
        <header className="text-center mb-6 pt-1 pb-1">
          <h1 className="text-2xl sm:text-2xl font-bold mb-1 text-blue-600">
            🔄 Minting in Progress
          </h1>
        </header>

        {/* Pack Image */}
        <div className="w-full mb-6 flex justify-center">
          <Image
            src={selectedPack.src}
            alt={selectedPack.alt}
            width={192}
            height={192}
            className="w-48 h-48 object-contain"
            priority
          />
        </div>

        {/* Progress Message */}
        <div className="w-full mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-800 mb-2">
              Follow your wallet instructions
            </div>
            <div className="text-sm text-blue-700">
              Please confirm the transaction in your wallet to complete the minting process.
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  // Show confirmation page after successful minting
  if (mintingState === 'success') {
    console.log('🎉 CONFIRMATION PAGE - Selected cards:', selectedCards);
    console.log('🎯 Confirmation card details:', selectedCards.map(cardId => {
      const carousel = Math.floor(cardId / 8) + 1;
      const position = (cardId % 8) + 1;
      return {
        cardId,
        carousel,
        position,
        image: `/carousel${carousel}-image${position}.jpg`
      };
    }));
    console.log('🎯 Minted NFTs:', mintedNFTs);
    
    return (
      <main
        className="flex flex-col items-center w-full max-w-md mx-auto px-8 py-4 bg-white text-black"
        style={{ minHeight: "100vh", overflowY: "auto" }}
      >
        <header className="text-center mb-6 pt-1 pb-1">
          <h1 className="text-2xl sm:text-2xl font-bold mb-1 text-green-600">
            Thank you for your purchase!
          </h1>
        </header>

        {/* Pack Image */}
        <div className="w-full mb-6 flex justify-center">
          <Image
            src={selectedPack.src}
            alt={selectedPack.alt}
            width={192}
            height={192}
            className="w-48 h-48 object-contain"
            priority
          />
        </div>

        {/* Transaction Details */}
        <div className="w-full mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-800 mb-4">
              Your cards are now in your wallet!
            </div>
            
            {/* Show actual NFT images in real proportions, vertically stacked */}
            {mintedNFTs && (
              <div className="flex flex-col items-center gap-3 mb-4">
                {mintedNFTs.map((nft) => (
                  <div key={nft.tokenId} className="inline-block rounded-lg border-2 border-gray-300 shadow-md p-2">
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      width={200}
                      height={150}
                      className="max-w-full h-auto object-contain"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).src = '/pack-all-random.png';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-sm text-green-700 mb-1">
              Transaction: Confirmed
            </div>
            <div className="text-sm text-green-700 mb-1">
              NFTs: {selectedPack.name}
            </div>
            <div className="text-sm text-green-700">
              Payment: Completed
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center w-full">
          <Link href="/pack-selection">
            <button
              className="text-white font-bold transition-colors text-base"
              style={{ 
                backgroundColor: '#000000',
                borderRadius: '25px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 700,
                paddingTop: '12px',
                paddingBottom: '12px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
            >
              Done
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex flex-col items-center w-full max-w-md mx-auto px-8 py-4 bg-white text-black"
      style={{ minHeight: "100vh", overflowY: "auto" }}
    >
      <header className="text-center mb-1 pt-1 pb-1">
        <h1 className="text-2xl sm:text-2xl font-bold mb-1">
          Choose your wallet
        </h1>
      </header>

      {/* Pack Image - NO frame, NO shadow, just the image */}
      <div className="w-full mb-4 flex justify-center">
        <Image
          src={selectedPack.src}
          alt={selectedPack.alt}
          width={192}
          height={192}
          className="w-48 h-48 object-contain"
          priority
        />
      </div>

      {/* Connection Status Display */}
      {(isActuallyConnected || (isConnected && address)) && address && (
        <div className="w-full mb-4 p-3 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <div className="text-sm text-green-800">
                <span className="font-semibold">Connected:</span> {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            </div>
            <button
              onClick={() => {
                disconnect();
                setWalletType(null);
              }}
              className="text-white font-bold transition-colors text-sm"
              style={{ 
                backgroundColor: '#DC2626',
                borderRadius: '25px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 700,
                paddingTop: '12px',
                paddingBottom: '12px',
                paddingLeft: '24px',
                paddingRight: '24px'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#B91C1C'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#DC2626'}
            >
              Disconnect
            </button>
          </div>
        </div>
      )}



      {/* Use Real Contract Checkbox */}
      <div className="w-full mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useRealContract}
            onChange={(e) => setUseRealContract(e.target.checked)}
            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">
            Test on Base Sepolia (connect wallet)
          </span>
        </label>
      </div>

      {/* Wallet Selection Buttons */}
      <div className="w-full space-y-3 mb-3">
        {/* Coinbase Wallet */}
        <button
          onClick={() => handleWalletSelect('coinbase')}
          disabled={isLoading}
          className={`w-full p-3 border-2 transition-all ${
            walletType === 'coinbase'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-300 bg-white'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ borderRadius: '50px' }}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 mr-3 flex items-center justify-center">
              <Image
                src="/icons/coinbaseLogo.svg"
                alt="Coinbase"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
            <span className="text-base font-light text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Coinbase Wallet</span>
          </div>
        </button>

        {/* Warpcast Wallet - Only show in Mini App mode */}
        {isMiniApp && (
          <button
            onClick={() => {
              console.log('🟣 Farcaster wallet button clicked!');
              handleWalletSelect('warpcast');
            }}
            disabled={isLoading}
            className={`w-full p-3 border-2 transition-all ${
              walletType === 'warpcast'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-300 bg-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ borderRadius: '50px' }}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3 flex items-center justify-center">
                <Image
                  src="/icons/warpcast-transparent-purple.svg"
                  alt="Warpcast"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <span className="text-base font-light text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Farcaster / Warpcast Wallet</span>
            </div>
          </button>
        )}

        {/* MetaMask Wallet */}
        <button
          onClick={() => handleWalletSelect('metamask')}
          disabled={isLoading}
          className={`w-full p-3 border-2 transition-all ${
            walletType === 'metamask'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-orange-300 bg-white'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ borderRadius: '50px' }}
        >
          <div className="flex items-center">
            <div className="w-8 h-8 mr-3 flex items-center justify-center">
              <Image
                src="/icons/MetaMask-icon-fox.svg"
                alt="MetaMask"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
            <span className="text-base font-light text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>MetaMask Wallet</span>
          </div>
        </button>
      </div>

      {/* Price Panel */}
      <div className="w-full mb-0 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-gray-300">
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-800 mb-1">
            Pack Price: FREE (Gas only)
          </div>
          <div className="text-xs text-gray-600">
            No payment required - testing NFT minting
          </div>
        </div>
      </div>

      {/* Disconnect Wallet Button removed - keeping only the one in the connection status */}

      {/* Action Buttons - SIDE BY SIDE - Perfect spacing achieved */}
      <div className="flex justify-between w-full mt-3 gap-3">
        <Link href={`/pack-selection?pack=${selectedPackIndex}`}>
          <button
            type="button"
            className="font-bold transition-colors text-base"
            style={{ 
              backgroundColor: 'transparent',
              borderRadius: '25px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 700,
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '24px',
              paddingRight: '24px',
              border: '2px solid #8FC5FF',
              color: '#8FC5FF'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(143, 197, 255, 0.1)'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
          >
            Cancel
          </button>
        </Link>
        
        {((isActuallyConnected || (isConnected && address)) && isOnBaseSepolia) ? (
          <button
            onClick={handleMint}
            className="text-white font-bold transition-colors text-base"
            style={{ 
              backgroundColor: '#000000',
              borderRadius: '25px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 700,
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '24px',
              paddingRight: '24px'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#0a0a0a'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#000000'}
          >
            {isLoading ? 'Connecting...' : 'Buy Pack'}
          </button>
        ) : (isActuallyConnected || (isConnected && address)) && !isOnBaseSepolia ? (
          <button
            disabled
            className="font-bold transition-colors text-base"
            style={{ 
              backgroundColor: '#9CA3AF',
              borderRadius: '25px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 700,
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '24px',
              paddingRight: '24px',
              color: '#FFFFFF'
            }}
          >
            Switch to Base Sepolia
          </button>
        ) : walletType ? (
          <button
            onClick={handleWalletConnect}
            disabled={isLoading}
            className="text-white font-bold transition-colors text-base"
            style={{ 
              backgroundColor: '#2563EB', // Darker blue for better contrast
              borderRadius: '25px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 700,
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '24px',
              paddingRight: '24px'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1D4ED8'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563EB'}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <button
            disabled
            className="font-bold transition-colors text-base"
            style={{ 
              backgroundColor: '#9CA3AF', // Disabled gray
              borderRadius: '25px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 700,
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '24px',
              paddingRight: '24px',
              color: '#FFFFFF'
            }}
          >
            Select Wallet
          </button>
        )}
      </div>
    </main>
  );
}

export default function WalletSelector() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WalletSelectorContent />
    </Suspense>
  );
}
