const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FREE NFT Contract to Base Sepolia...");

  const FreeNFT = await hre.ethers.getContractFactory("FreeNFT");
  const freeNFT = await FreeNFT.deploy();

  await freeNFT.deployed();

  const address = freeNFT.address;

  console.log("✅ FREE NFT Contract deployed to:", address);
  console.log("🎉 NFTs can now be minted for FREE (only gas fees)!");
  console.log("\n📋 Update your .env.local file:");
  console.log(`NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

