const hre = require("hardhat");

async function main() {
  console.log("Deploying DeediscoMinikit contract to BASE Sepolia testnet...");
  
  // Get the contract factory
  const DeediscoMinikit = await hre.ethers.getContractFactory("DeediscoMinikit");
  
  // Deploy the contract
  const baseURI = "https://deedisco-minikit-build.vercel.app/api/metadata/"; // Points to our metadata API
  const deediscoMinikit = await DeediscoMinikit.deploy(baseURI);
  
  // Wait for deployment
  await deediscoMinikit.deployed();
  
  const contractAddress = deediscoMinikit.address;
  
  console.log("✅ DeediscoMinikit deployed to BASE Sepolia:", contractAddress);
  console.log("Base URI:", baseURI);
  console.log("\n📋 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update lib/config.ts with the contract address");
  console.log("3. Test the app with real BASE Sepolia minting!");
  console.log("\n🔗 View on BaseScan:");
  console.log(`https://sepolia.basescan.org/address/${contractAddress}`);
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });