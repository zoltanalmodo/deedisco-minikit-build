"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function WalletSelector() {
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useRealContract, setUseRealContract] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Handle wallet connection
  const handleWalletConnect = async (wallet: string) => {
    setWalletType(wallet);
    setIsLoading(true);
    
    try {
      const targetConnector = connectors.find(c => {
        if (wallet === 'coinbase') return c.name.toLowerCase().includes('coinbase');
        if (wallet === 'metamask') return c.name.toLowerCase().includes('metamask');
        if (wallet === 'warpcast') return c.name.toLowerCase().includes('warpcast');
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
    
    console.log('🎯 Minting NFTs - isConnected:', isConnected, 'address:', address);
    
    // Mock minting for now
    const mockTransaction = {
      hash: '0x' + Math.random().toString(16).substr(2, 64),
      status: 'Success',
      payment: useRealContract ? '0.001 ETH' : 'Mock payment (testing)',
      nftsMinted: '3 random cards',
      tokenIds: '1, 2, 3'
    };
    
    console.log('✅ Mock minting successful:', mockTransaction);
    alert('NFTs minted successfully! Check console for details.');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20">
        {/* Pack Image Section */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Image
              src="/pack-all-random.png"
              alt="3 CARDS PACK"
              width={192}
              height={192}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>

        {/* Choose your wallet Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Choose your wallet
          </h1>
        </div>

        {/* Use Real Contract Checkbox */}
        <div className="mb-6">
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

        {/* Pack Price Information */}
        <div className="text-center mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="text-lg font-bold text-gray-800 mb-1">
            Pack Price: {useRealContract ? '0.001 ETH' : 'FREE (Gas only)'}
          </div>
          <div className="text-sm text-gray-600">
            {useRealContract ? 'Real payment required' : 'Mock payment (testing)'}
          </div>
        </div>

        {/* Wallet Selection Buttons */}
        <div className="space-y-3 mb-6">
          {/* Coinbase Wallet */}
          <button
            onClick={() => handleWalletConnect('coinbase')}
            disabled={isLoading}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              walletType === 'coinbase'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300 bg-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3 flex items-center justify-center bg-blue-100 rounded-full">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <span className="text-base font-semibold text-gray-800">Coinbase Wallet</span>
            </div>
          </button>

          {/* Warpcast Wallet */}
          <button
            onClick={() => handleWalletConnect('warpcast')}
            disabled={isLoading}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              walletType === 'warpcast'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-300 bg-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3 flex items-center justify-center bg-purple-100 rounded-full">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                </svg>
              </div>
              <span className="text-base font-semibold text-gray-800">Warpcast Wallet</span>
            </div>
          </button>

          {/* MetaMask Wallet */}
          <button
            onClick={() => handleWalletConnect('metamask')}
            disabled={isLoading}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              walletType === 'metamask'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-orange-300 bg-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3 flex items-center justify-center bg-orange-100 rounded-full">
                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                </svg>
              </div>
              <span className="text-base font-semibold text-gray-800">MetaMask Wallet</span>
            </div>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link href="/pack-selection" className="flex-1">
            <button
              className="w-full inline-flex items-center justify-center text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors"
              style={{
                borderRadius: '50px',
                paddingTop: '12px',
                paddingBottom: '12px',
              }}
            >
              Cancel
            </button>
          </Link>
          
          <button
            onClick={handleMint}
            disabled={!isConnected || isLoading}
            className="flex-1 inline-flex items-center justify-center text-base font-semibold text-white bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
            style={{
              borderRadius: '50px',
              paddingTop: '12px',
              paddingBottom: '12px',
            }}
          >
            {isLoading ? 'Connecting...' : 'Buy Pack'}
          </button>
        </div>
      </div>
    </main>
  );
}
