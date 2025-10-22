const hre = require("hardhat");

async function main() {
  console.log("Deploying DeediscoMinikit contract to BASE Sepolia testnet...");
  
  // Get the contract factory
  const DeediscoMinikit = await hre.ethers.getContractFactory("DeediscoMinikit");
  
  // Deploy the contract
  const baseURI = "https://ipfs.io/ipfs/QmYourMetadataHash/"; // Update with actual IPFS hash
  const deediscoMinikit = await DeediscoMinikit.deploy(baseURI);
  
  // Wait for deployment
  await deediscoMinikit.deployed();
  
  const contractAddress = deediscoMinikit.address;
  
  console.log("DeediscoMinikit deployed to:", contractAddress);
  console.log("Base URI:", baseURI);
  
  // Verify contract on BASE testnet (optional)
  console.log("\nTo verify the contract, run:");
  console.log(`npx hardhat verify --network baseSepolia ${contractAddress} "${baseURI}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
