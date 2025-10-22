const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DeediscoMinikit contract to local network...");
  
  // Get the contract factory
  const DeediscoMinikit = await ethers.getContractFactory("DeediscoMinikit");
  
  // Deploy the contract
  const baseURI = "https://ipfs.io/ipfs/QmYourMetadataHash/"; // Update with actual IPFS hash
  const deediscoMinikit = await DeediscoMinikit.deploy(baseURI);
  
  // Wait for deployment
  await deediscoMinikit.waitForDeployment();
  
  const contractAddress = await deediscoMinikit.getAddress();
  
  console.log("✅ DeediscoMinikit deployed to:", contractAddress);
  console.log("Base URI:", baseURI);
  console.log("\n📋 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update lib/config.ts with the contract address");
  console.log("3. Test the app with real minting!");
  
  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
