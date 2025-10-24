const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FIXED NFT Contract to Base Sepolia...");
  console.log("   This contract stores card IDs to ensure correct metadata!");

  const FreeNFTFixed = await hre.ethers.getContractFactory("FreeNFTFixed");
  const freeNFTFixed = await FreeNFTFixed.deploy();

  await freeNFTFixed.deployed();

  const address = freeNFTFixed.address;

  console.log("✅ FIXED NFT Contract deployed to:", address);
  console.log("🎉 NFTs will now show correct images in wallets!");
  console.log("\n📋 Update your .env.local file:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${address}`);
  console.log("\n📋 Update Vercel environment variable:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

