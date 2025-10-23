"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useMintPack } from "../../lib/hooks/useMintPack";

export default function WalletSelector() {
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useRealContract, setUseRealContract] = useState(false);
  const [mintingState, setMintingState] = useState<'idle' | 'minting' | 'confirming' | 'success' | 'error'>('idle');
  const [mintResult, setMintResult] = useState<{
    hash?: string;
    transactionHash?: string;
    nftsMinted?: string;
    payment?: string;
    error?: string;
  } | null>(null);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { } = useDisconnect();
  const { mintPack, isLoading: isMinting } = useMintPack();

  // Handle wallet selection (NOT connection)
  const handleWalletSelect = (wallet: string) => {
    setWalletType(wallet);
    console.log('🎯 Wallet selected:', wallet);
  };

  // Handle actual wallet connection
  const handleWalletConnect = async () => {
    if (!walletType) {
      alert('Please select a wallet first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const targetConnector = connectors.find(c => {
        if (walletType === 'coinbase') return c.name.toLowerCase().includes('coinbase');
        if (walletType === 'metamask') return c.name.toLowerCase().includes('metamask');
        if (walletType === 'warpcast') return c.name.toLowerCase().includes('warpcast');
        return false;
      });

      if (targetConnector) {
        await connect({ connector: targetConnector });
      }
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle minting
  const handleMint = async () => {
    if (!isConnected) return;
    
    console.log('🎯 Minting NFTs - isConnected:', isConnected, 'address:', address, 'useRealContract:', useRealContract);
    
    if (useRealContract) {
      // REAL CONTRACT MINTING
      console.log('🔥 REAL CONTRACT MINTING - This will use the actual blockchain!');
      setMintingState('minting');
      
      try {
        const result = await mintPack();
        if (result.success) {
          console.log('✅ REAL MINTING SUCCESSFUL:', result);
          setMintingState('success');
          setMintResult(result);
        } else {
          console.error('❌ REAL MINTING FAILED:', result.error);
          setMintingState('error');
          setMintResult({ error: result.error });
        }
      } catch (error) {
        console.error('❌ REAL MINTING ERROR:', error);
        setMintingState('error');
        setMintResult({ error: error instanceof Error ? error.message : String(error) });
      }
    } else {
      // MOCK MINTING
      setMintingState('minting');
      
      // Simulate minting delay
      setTimeout(() => {
        const mockTransaction = {
          hash: '0x' + Math.random().toString(16).substr(2, 64),
          status: 'Success',
          payment: 'Mock payment (testing)',
          nftsMinted: '3 random cards',
          tokenIds: '1, 2, 3'
        };
        
        console.log('✅ Mock minting successful:', mockTransaction);
        setMintingState('success');
        setMintResult(mockTransaction);
      }, 2000);
    }
  };

  // Show confirmation page after successful minting
  if (mintingState === 'success') {
    return (
      <main
        className="flex flex-col items-center w-full max-w-md mx-auto px-8 py-4 bg-white text-black"
        style={{ minHeight: "100vh", overflowY: "auto" }}
      >
        <header className="text-center mb-6 pt-1 pb-1">
          <h1 className="text-2xl sm:text-2xl font-bold mb-1 text-green-600">
            ✅ NFTs Minted Successfully!
          </h1>
        </header>

        {/* Pack Image */}
        <div className="w-full mb-6 flex justify-center">
          <Image
            src="/pack-all-random.png"
            alt="3 CARDS PACK"
            width={192}
            height={192}
            className="w-48 h-48 object-contain"
            priority
          />
        </div>

        {/* Transaction Details */}
        <div className="w-full mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-800 mb-2">
              Your NFTs are now in your wallet!
            </div>
            <div className="text-sm text-green-700 mb-1">
              Transaction: {mintResult?.transactionHash || mintResult?.hash || 'N/A'}
            </div>
            <div className="text-sm text-green-700 mb-1">
              NFTs: {mintResult?.nftsMinted || '3 random cards'}
            </div>
            <div className="text-sm text-green-700">
              Payment: {mintResult?.payment || 'Completed'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between w-full gap-3">
          <button
            onClick={() => {
              setMintingState('idle');
              setMintResult(null);
            }}
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
          >
            Mint More
          </button>
          
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
              Back to Packs
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
          src="/pack-all-random.png"
          alt="3 CARDS PACK"
          width={192}
          height={192}
          className="w-48 h-48 object-contain"
          priority
        />
      </div>

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
            Use Real Contract (requires wallet connection)
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

        {/* Warpcast Wallet */}
        <button
          onClick={() => handleWalletSelect('warpcast')}
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
            Pack Price: {useRealContract ? '0.001 ETH' : 'FREE (Gas only)'}
          </div>
          <div className="text-xs text-gray-600">
            {useRealContract ? 'Real payment required' : 'Mock payment (testing)'}
          </div>
        </div>
      </div>

      {/* Action Buttons - SIDE BY SIDE - Perfect spacing achieved */}
      <div className="flex justify-between w-full mt-3 gap-3">
        <Link href="/pack-selection">
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
        
        {isConnected ? (
          <button
            onClick={handleMint}
            disabled={isLoading || isMinting}
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
            {isLoading ? 'Connecting...' : mintingState === 'minting' ? 'Minting NFTs - confirm wallet request...' : 'Buy Pack'}
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
