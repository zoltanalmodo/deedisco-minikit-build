# Deedisco Minikit Contract Deployment Guide

## Prerequisites

1. **Install Hardhat and dependencies:**
   ```bash
   cd contracts
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the contracts directory:
   ```env
   PRIVATE_KEY=your_wallet_private_key
   BASESCAN_API_KEY=your_basescan_api_key
   ```

3. **Get BASE testnet ETH:**
   - Visit [BASE Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
   - Connect your wallet and request testnet ETH

## Deployment Steps

### 1. Compile the contract
```bash
npm run compile
```

### 2. Deploy to BASE testnet
```bash
npm run deploy:testnet
```

### 3. Update contract address
After deployment, update the contract address in your app:
1. Copy the deployed contract address
2. Update `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS` in your environment variables
3. Update the address in `lib/config.ts`

### 4. Verify the contract (optional)
```bash
npm run verify:testnet
```

## Contract Features

- **ERC-721 Standard**: Full NFT compatibility
- **Pack Minting**: Mints exactly 3 cards per pack
- **Owner Controls**: Only contract owner can mint
- **Metadata Support**: IPFS-based metadata
- **Events**: PackMinted event for tracking

## Contract Addresses

- **BASE Testnet**: `0x...` (Update after deployment)
- **BASE Mainnet**: `0x...` (Update after deployment)

## Next Steps

1. Deploy the contract
2. Update the contract address in your app
3. Test the minting functionality
4. Deploy to Vercel with environment variables
