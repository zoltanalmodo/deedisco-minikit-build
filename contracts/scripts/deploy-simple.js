const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DeediscoMinikit contract to BASE Sepolia testnet...");
  
  const signers = await ethers.getSigners();
  if (signers.length === 0) {
    throw new Error("No signers found. Check your private key in .env file.");
  }
  
  const deployer = signers[0];
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Get the contract factory
  const DeediscoMinikit = await ethers.getContractFactory("DeediscoMinikit");
  
  // Deploy the contract
  const baseURI = "https://ipfs.io/ipfs/QmYourMetadataHash/";
  console.log("Deploying contract...");
  
  const deediscoMinikit = await DeediscoMinikit.deploy(baseURI);
  
  console.log("Waiting for deployment...");
  await deediscoMinikit.deployed();
  
  console.log("✅ DeediscoMinikit deployed to:", deediscoMinikit.address);
  console.log("Base URI:", baseURI);
  console.log("\n📋 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update lib/config.ts with the contract address");
  console.log("3. Test the app with real BASE Sepolia minting!");
  console.log("\n🔗 View on BaseScan:");
  console.log(`https://sepolia.basescan.org/address/${deediscoMinikit.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
